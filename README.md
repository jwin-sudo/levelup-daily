# Level Up

An AI life coach that reads your journal and tells you how to level up as a person.

**Live app:** https://levelup-daily-eight.vercel.app

---

## What it does

Level Up turns daily journaling into a coaching loop. Instead of writing into a void, you have a conversation with an AI coach that knows your goals. When you end the session, it analyzes the conversation, awards XP, updates your character trait scores, and drops milestone cards onto your path — giving you a concrete sense of progress toward the person you want to become.

**Four tabs:**

- **Home** — visual path with milestone cards for your short-term and long-term goals
- **Journal** — chat-style daily session with your AI coach (one entry per day)
- **Goals** — set short-term and long-term goals that shape the coaching conversation
- **Progress** — XP total, daily streak, and five character trait scores

**Five character traits** that grow through journaling: Stoicism, Resilience, Patience, Action-Orientation, Critical Thinking.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, SQLModel |
| AI | Anthropic Claude API |
| Frontend | React, TypeScript, Vite, Tailwind CSS v4 |
| State management | Zustand v5 |
| Database | SQLite (local), PostgreSQL (production) |
| Deployment | Railway (backend), Vercel (frontend) |

---

## Project structure

```
levelup-daily/
├── backend/
│   ├── main.py              # FastAPI app, CORS, startup seed
│   ├── models.py            # SQLModel table definitions
│   ├── schemas.py           # Pydantic request/response shapes
│   ├── database.py          # Engine + get_session() dependency
│   ├── routers/
│   │   ├── journal.py       # GET /journal/today, POST /journal/message, POST /journal/complete
│   │   ├── goals.py         # CRUD /goals
│   │   ├── stats.py         # GET /stats
│   │   └── home.py          # GET /home
│   └── services/
│       ├── claude.py        # Anthropic SDK wrapper (opening message, chat, analysis)
│       └── streak.py        # Daily streak logic
└── frontend/
    └── src/
        ├── api/client.ts    # Typed fetch wrappers for all endpoints
        ├── stores/          # Zustand stores (journal, goal, stats)
        ├── components/      # ChatWindow, DebriefScreen, PathVisualization, etc.
        └── pages/           # Home, Journal, Goals, Progress
```

---

## Local setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
ANTHROPIC_API_KEY=your_key_here
FRONTEND_URL=http://localhost:5173
```

Start the server:

```bash
uvicorn main:app --reload
```

API docs available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

App runs at `http://localhost:5173`.

---

## Deployment

- **Backend:** Railway — connect the repo, add the PostgreSQL plugin, set `ANTHROPIC_API_KEY` and `FRONTEND_URL` in Variables. The `Procfile` handles startup.
- **Frontend:** Vercel — set root directory to `frontend/`, set `VITE_API_URL` to the Railway backend URL.

---

## How the AI works

Every journal session is a conversation. The Claude system prompt is built dynamically at request time — it includes the user's active goals and the last 7 debrief summaries (not raw chat logs, to keep the context window lean).

When the user clicks **End Session**, a single `POST /journal/complete` call fires the analysis. Claude returns a structured JSON object with XP, trait deltas, strengths, areas to improve, suggestions, and any goal-connected path milestones. All DB updates (XP, streak, trait scores, milestones) are applied atomically in one commit.

---

## Docs

Planning artifacts from the build process are in `docs/`:

- `scope.md` — project scope and core decisions
- `prd.md` — product requirements
- `spec.md` — technical specification
- `checklist.md` — step-by-step build plan
