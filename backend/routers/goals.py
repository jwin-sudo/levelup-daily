from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import Goal, PathMilestone
from schemas import CreateGoalRequest, UpdateGoalRequest

router = APIRouter()


@router.get("")
def list_goals(session: Session = Depends(get_session)):
    goals = session.exec(select(Goal)).all()
    return {
        "short_term": [g for g in goals if g.type == "short_term"],
        "long_term": [g for g in goals if g.type == "long_term"],
    }


@router.post("", status_code=201)
def create_goal(body: CreateGoalRequest, session: Session = Depends(get_session)):
    goal = Goal(title=body.title, type=body.type)
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal


@router.patch("/{goal_id}")
def update_goal(goal_id: int, body: UpdateGoalRequest, session: Session = Depends(get_session)):
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    goal.title = body.title
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: int, session: Session = Depends(get_session)):
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    milestones = session.exec(select(PathMilestone).where(PathMilestone.goal_id == goal_id)).all()
    for m in milestones:
        session.delete(m)
    session.delete(goal)
    session.commit()
