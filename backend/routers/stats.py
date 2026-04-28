from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_session
from models import UserStats, TraitScore
from schemas import StatsResponse

router = APIRouter()


@router.get("", response_model=StatsResponse)
def get_stats(session: Session = Depends(get_session)):
    stats = session.exec(select(UserStats)).first()
    traits = session.exec(select(TraitScore)).all()
    return StatsResponse(
        xp_total=stats.xp_total if stats else 0,
        streak_count=stats.streak_count if stats else 0,
        trait_scores={t.trait: t.score for t in traits},
    )
