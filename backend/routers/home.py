from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_session
from models import Goal, PathMilestone
from schemas import HomeResponse

router = APIRouter()


@router.get("", response_model=HomeResponse)
def get_home(session: Session = Depends(get_session)):
    goals = {g.id: g for g in session.exec(select(Goal)).all()}
    milestones = session.exec(select(PathMilestone)).all()

    short_term = []
    long_term = []
    for m in milestones:
        goal = goals.get(m.goal_id)
        entry = {"id": m.id, "goal_id": m.goal_id, "label": m.label, "order": m.order}
        if goal and goal.type == "short_term":
            short_term.append(entry)
        elif goal and goal.type == "long_term":
            long_term.append(entry)

    short_term.sort(key=lambda x: x["order"])
    long_term.sort(key=lambda x: x["order"])

    return HomeResponse(short_term_milestones=short_term, long_term_milestones=long_term)
