from typing import Literal, Optional
from pydantic import BaseModel


class SendMessageRequest(BaseModel):
    content: str


class CreateGoalRequest(BaseModel):
    title: str
    type: Literal["short_term", "long_term"]


class UpdateGoalRequest(BaseModel):
    title: str


class MessageResponse(BaseModel):
    role: str
    content: str


class DebriefResponse(BaseModel):
    xp_awarded: int
    strengths: str
    areas_to_improve: str
    suggestions: str
    trait_deltas: dict[str, int]
    goal_connections: Optional[str]
    path_milestones: list[dict]
    streak_count: int
    weekly_streak: list[bool]  # [Mon, Tue, Wed, Thu, Fri, Sat, Sun]


class StatsResponse(BaseModel):
    xp_total: int
    streak_count: int
    trait_scores: dict[str, int]


class HomeResponse(BaseModel):
    short_term_milestones: list[dict]
    long_term_milestones: list[dict]
