import json
from datetime import date as Date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import Goal, JournalEntry, PathMilestone, TraitScore, UserStats
from schemas import DebriefResponse, MessageResponse, SendMessageRequest
from services import claude
from services import streak as streak_service

router = APIRouter()


def _get_goals(session: Session) -> list:
    return list(session.exec(select(Goal)).all())


def _get_stats(session: Session) -> UserStats | None:
    return session.exec(select(UserStats)).first()


def _parse_messages(entry: JournalEntry) -> list[dict]:
    return json.loads(entry.messages)


@router.get("/today")
def get_today(session: Session = Depends(get_session)):
    today = Date.today()
    entry = session.exec(select(JournalEntry).where(JournalEntry.date == today)).first()

    if entry is None:
        goals = _get_goals(session)
        stats = _get_stats(session)
        try:
            opening = claude.get_opening_message(goals, stats)
        except Exception:
            raise HTTPException(status_code=503, detail="AI unavailable — please try again.")
        messages = [{"role": "assistant", "content": opening}]
        entry = JournalEntry(date=today, messages=json.dumps(messages))
        session.add(entry)
        session.commit()
        session.refresh(entry)
        return {"status": "active", "messages": messages}

    messages = _parse_messages(entry)
    status = "completed" if entry.completed else "active"
    return {"status": status, "messages": messages}


@router.post("/message", response_model=MessageResponse)
def post_message(body: SendMessageRequest, session: Session = Depends(get_session)):
    today = Date.today()
    entry = session.exec(select(JournalEntry).where(JournalEntry.date == today)).first()

    if entry is None:
        raise HTTPException(status_code=404, detail="No journal session for today — call GET /journal/today first.")
    if entry.completed:
        raise HTTPException(status_code=400, detail="Today's journal session is already completed.")

    messages = _parse_messages(entry)
    messages.append({"role": "user", "content": body.content})

    goals = _get_goals(session)
    stats = _get_stats(session)

    try:
        reply = claude.send_message(messages, goals, stats, recent_debriefs=[])
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=503, detail="AI unavailable — please try again.")

    messages.append({"role": "assistant", "content": reply})
    entry.messages = json.dumps(messages)
    session.add(entry)
    session.commit()

    return MessageResponse(role="assistant", content=reply)


@router.post("/complete", response_model=DebriefResponse)
def post_complete(session: Session = Depends(get_session)):
    today = Date.today()
    entry = session.exec(select(JournalEntry).where(JournalEntry.date == today)).first()

    if entry is None:
        raise HTTPException(status_code=404, detail="No journal session for today.")
    if entry.completed:
        raise HTTPException(status_code=400, detail="Today's session is already completed.")

    # Mark completed first so the entry is never left in a broken state if Claude fails
    entry.completed = True
    session.add(entry)
    session.commit()
    session.refresh(entry)

    messages = _parse_messages(entry)
    goals = _get_goals(session)
    stats = _get_stats(session)

    try:
        analysis = claude.analyze_entry(messages, goals, stats, recent_debriefs=[])
    except HTTPException:
        raise

    # Apply all remaining updates atomically
    entry.xp_awarded = analysis["xp_awarded"]
    session.add(entry)

    # Streak must be computed before updating last_journaled_date
    new_streak = streak_service.update_streak(stats)
    stats.xp_total += analysis["xp_awarded"]
    stats.last_journaled_date = today
    session.add(stats)

    trait_deltas = analysis.get("trait_deltas", {})
    for trait_row in session.exec(select(TraitScore)).all():
        delta = trait_deltas.get(trait_row.trait, 0)
        if delta:
            trait_row.score += delta
            session.add(trait_row)

    path_milestones_data = analysis.get("path_milestones", [])
    for milestone in path_milestones_data:
        goal_id = milestone.get("goal_id")
        label = milestone.get("label", "")
        order = milestone.get("order", 0)
        if goal_id and label:
            session.add(PathMilestone(goal_id=goal_id, label=label, order=order))

    session.commit()

    # Build weekly_streak: Mon–Sun boolean list
    monday = today - timedelta(days=today.weekday())
    week_entries = session.exec(
        select(JournalEntry).where(
            JournalEntry.date >= monday,
            JournalEntry.date <= monday + timedelta(days=6),
            JournalEntry.completed == True,
        )
    ).all()
    completed_dates = {e.date for e in week_entries}
    weekly_streak = [monday + timedelta(days=i) in completed_dates for i in range(7)]

    return DebriefResponse(
        xp_awarded=analysis["xp_awarded"],
        strengths=analysis["strengths"],
        areas_to_improve=analysis["areas_to_improve"],
        suggestions=analysis["suggestions"],
        trait_deltas=analysis.get("trait_deltas", {}),
        goal_connections=analysis.get("goal_connections"),
        path_milestones=path_milestones_data,
        streak_count=new_streak,
        weekly_streak=weekly_streak,
    )
