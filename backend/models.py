from datetime import date as Date, datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class JournalEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: Date = Field(unique=True)
    messages: str  # JSON-encoded list of {role, content}
    completed: bool = Field(default=False)
    xp_awarded: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Goal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    type: str  # "short_term" | "long_term"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TraitScore(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    trait: str  # "stoicism" | "resilience" | "patience" | "action_orientation" | "critical_thinking"
    score: int = Field(default=0)


class UserStats(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    xp_total: int = Field(default=0)
    streak_count: int = Field(default=0)
    last_journaled_date: Optional[Date] = Field(default=None)


class PathMilestone(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    goal_id: int = Field(foreign_key="goal.id")
    label: str
    order: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
