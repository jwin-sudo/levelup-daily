import json
from datetime import date as Date

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import Goal, JournalEntry, UserStats
from schemas import MessageResponse, SendMessageRequest
from services import claude

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
