import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, select

load_dotenv()

from database import engine
from models import UserStats, TraitScore
from routers import journal, goals, stats, home

TRAITS = [
    "stoicism",
    "resilience",
    "patience",
    "action_orientation",
    "critical_thinking",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        if not session.exec(select(UserStats)).first():
            session.add(UserStats())
        if not session.exec(select(TraitScore)).first():
            for trait in TRAITS:
                session.add(TraitScore(trait=trait, score=0))
        session.commit()
    yield


app = FastAPI(title="Level Up API", lifespan=lifespan)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(journal.router, prefix="/journal", tags=["journal"])
app.include_router(goals.router, prefix="/goals", tags=["goals"])
app.include_router(stats.router, prefix="/stats", tags=["stats"])
app.include_router(home.router, prefix="/home", tags=["home"])
