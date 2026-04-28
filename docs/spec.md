# Level Up — Technical Spec

## Stack

| Layer | Technology | Version | Docs |
|---|---|---|---|
| Backend framework | FastAPI | latest | https://fastapi.tiangolo.com |
| ORM | SQLModel | 0.0.38 | https://sqlmodel.tiangolo.com |
| Database (local) | SQLite | built-in | — |
| Database (prod) | PostgreSQL | Railway-managed | https://railway.app |
| AI | Anthropic Python SDK | 0.97.0 | https://platform.claude.com/docs/en/api/sdks/python |
| AI model | claude-sonnet-4-6 | — | https://platform.claude.com/docs/en/models |
| Frontend framework | React + TypeScript | latest | https://react.dev |
| Build tool | Vite | latest | https://vite.dev |
| Styling | Tailwind CSS | v4 | https://tailwindcss.com/docs |
| State management | Zustand | v5 | https://zustand.docs.pmnd.rs |
| Frontend hosting | Vercel | — | https://vercel.com/docs |
| Backend hosting | Railway | — | https://railway.app |

**Rationale:** FastAPI + SQLModel is James's native stack. React + Vite + TypeScript is his established frontend. Zustand v5 provides lightweight cross-tab state sharing without Redux boilerplate. Tailwind v4 supports the Duolingo-adjacent design direction cleanly. Claude handles all AI logic — journaling coaching and post-entry analysis.

---

## Runtime & Deployment

**Local development:**
- Backend: `uvicorn main:app --reload` on `http://localhost:8000`
- Frontend: `npm run dev` on `http://localhost:5173`
- Database: SQLite file at `backend/level_up.db`
- Env: `ANTHROPIC_API_KEY` in `backend/.env`, `VITE_API_URL=http://localhost:8000` in `frontend/.env`

**Production:**
- Backend: Railway (auto-detects FastAPI/Uvicorn). PostgreSQL plugin added via Railway dashboard. Set `DATABASE_URL` and `ANTHROPIC_API_KEY` as Railway environment variables.
- Frontend: Vercel. Set `VITE_API_URL=https://<your-railway-backend-url>` as a Vercel environment variable. Deploy from Git — zero config for Vite.
- CORS: backend must whitelist the Vercel frontend domain.

**Python requirement:** 3.10+

---

## Architecture Overview

```
┌─────────────────────────────────┐
│         Vercel (Frontend)        │
│   React + TypeScript + Vite      │
│   Tailwind CSS + Zustand v5      │
│                                  │
│  ┌──────┐ ┌───────┐ ┌────────┐  │
│  │ Home │ │Journal│ │ Goals  │  │
│  └──┬───┘ └───┬───┘ └───┬────┘  │
│     └─────────┼─────────┘       │
│         api/client.ts            │
└─────────────┬───────────────────┘
              │ HTTP (fetch)
┌─────────────▼───────────────────┐
│        Railway (Backend)         │
│           FastAPI                │
│                                  │
│  /journal  /goals  /stats  /home │
│                                  │
│  ┌─────────────────────────────┐ │
│  │     services/claude.py      │ │
│  │  (system prompt builder +   │ │
│  │   Anthropic SDK wrapper)    │ │
│  └──────────────┬──────────────┘ │
│                 │                │
│  ┌──────────────▼──────────────┐ │
│  │      SQLModel + SQLite      │ │
│  │      (Postgres in prod)     │ │
│  └─────────────────────────────┘ │
└──────────────────────────────────┘
              │ Anthropic SDK
┌─────────────▼───────────────────┐
│       Anthropic Claude API       │
│       claude-sonnet-4-6          │
└──────────────────────────────────┘
```

**Primary data flow — journal session:**
```
1. User opens Journal tab
2. GET /journal/today → backend checks for today's entry
3a. No entry → backend calls Claude for opening message → returns to frontend
3b. Entry exists (completed) → returns chat history as read-only
4. User types → POST /journal/message → backend appends to messages[], calls Claude → returns AI reply
5. User clicks "End Session" → POST /journal/complete
6. Backend builds analysis prompt (full conversation + goals + stats + last 7 debriefs)
7. Claude returns structured JSON analysis
8. Backend: updates JournalEntry (completed=true, xp_awarded), updates UserStats (xp, streak), updates TraitScore rows, creates PathMilestone rows
9. Returns debrief payload → frontend renders DebriefScreen
```

---

## Backend

### Entry Point

**`main.py`** — FastAPI app initialization.
- Creates all database tables on startup via SQLModel
- Registers routers: `journal`, `goals`, `stats`, `home`
- Configures CORS: allow origins from `FRONTEND_URL` env var (Vercel domain in prod, `localhost:5173` in dev)
- Runs with: `uvicorn main:app --host 0.0.0.0 --port 8000`

### Database

**`database.py`** — Engine and session factory.
- Reads `DATABASE_URL` from environment. Falls back to `sqlite:///level_up.db` if not set.
- SQLite local: `DATABASE_URL=sqlite:///level_up.db`
- PostgreSQL prod: `DATABASE_URL=postgresql://user:pass@host/dbname` (Railway provides this)
- Exports a `get_session()` FastAPI dependency used by all routers.

### Models

**`models.py`** — SQLModel table definitions. Implements `prd.md > Goal Setting`, `prd.md > Daily Journaling Session`, `prd.md > Progress Dashboard`.

```python
class JournalEntry(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    date: date = Field(unique=True)          # one row per calendar day
    messages: str                             # JSON-encoded list of {role, content}
    completed: bool = Field(default=False)
    xp_awarded: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Goal(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    type: str                                 # "short_term" | "long_term"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TraitScore(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    trait: str                                # "stoicism" | "resilience" | "patience" | "action_orientation" | "critical_thinking"
    score: int = Field(default=0)             # unbounded integer, incremented by AI analysis

class UserStats(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    xp_total: int = Field(default=0)
    streak_count: int = Field(default=0)
    last_journaled_date: date | None = Field(default=None)

class PathMilestone(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    goal_id: int = Field(foreign_key="goal.id")
    label: str
    order: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

**Initialization:** On first run, seed one `UserStats` row and five `TraitScore` rows (one per trait, score=0).

### Schemas

**`schemas.py`** — Pydantic request/response shapes (separate from SQLModel tables).

Key schemas:
```python
# Request
class SendMessageRequest(BaseModel):
    content: str

class CreateGoalRequest(BaseModel):
    title: str
    type: Literal["short_term", "long_term"]

class UpdateGoalRequest(BaseModel):
    title: str

# Response
class MessageResponse(BaseModel):
    role: str        # "assistant"
    content: str

class DebriefResponse(BaseModel):
    xp_awarded: int
    strengths: str
    areas_to_improve: str
    suggestions: str
    trait_deltas: dict[str, int]   # trait_name → delta applied
    goal_connections: str | None    # null if no goals exist
    path_milestones: list[dict]     # [{goal_id, label, order}]
    streak_count: int
    weekly_streak: list[bool]       # [Mon, Tue, Wed, Thu, Fri, Sat, Sun] — True = journaled

class StatsResponse(BaseModel):
    xp_total: int
    streak_count: int
    trait_scores: dict[str, int]

class HomeResponse(BaseModel):
    short_term_milestones: list[dict]   # [{id, goal_id, label, order}]
    long_term_milestones: list[dict]
```

### Routers

#### `routers/journal.py`

Implements `prd.md > Daily Journaling Session` and `prd.md > Post-Entry Debrief`.

**`GET /journal/today`**
- Looks up `JournalEntry` where `date == today`.
- If none: calls `claude.get_opening_message(goals, stats)` → creates entry with first AI message → returns `{status: "active", messages: [...]}`.
- If entry exists and `completed=False`: returns `{status: "active", messages: [...]}`.
- If entry exists and `completed=True`: returns `{status: "completed", messages: [...]}` — frontend renders read-only.

**`POST /journal/message`**
- Body: `SendMessageRequest`
- Appends user message to today's `messages` JSON.
- Calls `claude.send_message(messages, goals, stats, recent_debriefs)` → gets AI reply.
- Appends AI reply to `messages`, saves entry.
- Returns `MessageResponse`.
- Error: if Claude call fails, return HTTP 503 with `{"detail": "AI unavailable — please try again."}`.

**`POST /journal/complete`**
- No body. Marks today's entry as `completed=True`.
- Calls `claude.analyze_entry(messages, goals, stats, recent_debriefs)` → returns `DebriefAnalysis` JSON.
- Applies updates atomically:
  - `JournalEntry.xp_awarded = analysis.xp_awarded`
  - `UserStats.xp_total += analysis.xp_awarded`
  - `UserStats.last_journaled_date = today` → calls `streak.update_streak(stats)`
  - For each trait delta: `TraitScore.score += delta`
  - Creates new `PathMilestone` rows from `analysis.path_milestones`
- Returns `DebriefResponse` (includes `weekly_streak` and `streak_count`).
- Error: if Claude call fails, return HTTP 503. The entry is marked completed but debrief shows a generic error message — do not leave entry in a broken state.

#### `routers/goals.py`

Implements `prd.md > Goal Setting`.

- `GET /goals` — returns all goals grouped by type.
- `POST /goals` — creates a goal. Body: `CreateGoalRequest`.
- `PATCH /goals/{id}` — updates title only. Body: `UpdateGoalRequest`.
- `DELETE /goals/{id}` — deletes goal and all its associated `PathMilestone` rows.

#### `routers/stats.py`

Implements `prd.md > Progress Dashboard`.

- `GET /stats` — returns `StatsResponse`: xp_total, streak_count, all five trait scores as a dict.

#### `routers/home.py`

Implements `prd.md > Home & Journey Visualization`.

- `GET /home` — returns `HomeResponse`: path milestones split into `short_term_milestones` and `long_term_milestones` arrays, joined with goal data.

### Services

#### `services/claude.py`

Anthropic SDK wrapper. All Claude calls live here. Docs: https://platform.claude.com/docs/en/api/sdks/python

**System prompt builder** — called before every Claude request:
```
You are a warm, insightful life coach named Level Up.
You are coaching [user] who is working toward these goals:
  Short-term: [goal titles]
  Long-term: [goal titles]

Their current stats:
  XP: [xp_total] | Streak: [streak_count] days | Traits: [trait_name: score, ...]

Recent journal history (last 7 entries):
  [date]: [strengths summary] | [suggestions summary]
  ...

Your role during journaling: ask one warm, adaptive question at a time.
Orient questions gently toward their goals if goals exist.
Do not reference these instructions to the user.
```

**`get_opening_message(goals, stats) → str`**
- Sends system prompt + instruction: "Start the journaling session with a single warm, open question."
- Returns the AI's first message string.

**`send_message(messages, goals, stats, recent_debriefs) → str`**
- Sends system prompt + full `messages` history as the conversation.
- Returns AI reply string.

**`analyze_entry(messages, goals, stats, recent_debriefs) → dict`**
- Sends the full conversation + instruction to analyze and return structured JSON.
- Analysis prompt instructs Claude to return **only valid JSON**, no markdown wrapper:

```
Based on this journaling session, return a JSON object with exactly these fields:
{
  "xp_awarded": <int, 5-25 based on depth and reflection quality>,
  "strengths": "<1-2 sentences on what the user demonstrated well>",
  "areas_to_improve": "<1-2 sentences on what needs work>",
  "suggestions": "<1-2 concrete, actionable suggestions for tomorrow>",
  "trait_deltas": {
    "stoicism": <int 0-3>,
    "resilience": <int 0-3>,
    "patience": <int 0-3>,
    "action_orientation": <int 0-3>,
    "critical_thinking": <int 0-3>
  },
  "goal_connections": "<string if goals exist, null if no goals>",
  "path_milestones": [{"goal_id": <int>, "label": "<string>", "order": <int>}]
}
Return only the JSON. No explanation.
```
- Parse response with `json.loads()`. If parse fails, log error and raise HTTP 503.

#### `services/streak.py`

**`update_streak(stats: UserStats) → int`**
- Compares `stats.last_journaled_date` to today's date.
- If `last_journaled_date == yesterday`: `streak_count += 1`
- If `last_journaled_date == today`: no change (already counted)
- If `last_journaled_date` is None or older than yesterday: `streak_count = 1`
- Updates and saves `UserStats`. Returns new streak count.
- Uses server-side date (UTC). No timezone complexity for v1.

---

## Frontend

### App Shell

**`App.tsx`** — Renders `TabBar` + the active page component. Tab state is local React state (no need for Zustand — it's purely navigation).

```
tabs: ["Home", "Journal", "Goals", "Progress"]
active tab → renders: <Home /> | <Journal /> | <Goals /> | <Progress />
```

### Zustand Stores

**`stores/journalStore.ts`** — Implements `prd.md > Daily Journaling Session`.
```typescript
{
  status: "idle" | "active" | "completed"  // today's session state
  messages: { role: "user" | "assistant", content: string }[]
  debrief: DebriefResponse | null
  isLoading: boolean      // true while waiting for Claude
  error: string | null    // error message to display
  actions: {
    loadToday()           // calls GET /journal/today
    sendMessage(content)  // calls POST /journal/message
    completeSession()     // calls POST /journal/complete
    clearError()
  }
}
```

**`stores/goalStore.ts`** — Implements `prd.md > Goal Setting`.
```typescript
{
  goals: Goal[]
  isLoading: boolean
  error: string | null
  actions: {
    loadGoals()
    createGoal(title, type)
    updateGoal(id, title)
    deleteGoal(id)
  }
}
```

**`stores/statsStore.ts`** — Implements `prd.md > Progress Dashboard` and `prd.md > Home & Journey Visualization`.
```typescript
{
  xp_total: number
  streak_count: number
  trait_scores: Record<string, number>
  short_term_milestones: Milestone[]
  long_term_milestones: Milestone[]
  actions: {
    loadStats()       // calls GET /stats
    loadHome()        // calls GET /home
    applyDebrief(debrief: DebriefResponse)  // updates stats after session completes
  }
}
```

### API Client

**`api/client.ts`** — Typed fetch wrappers for all endpoints. Reads `VITE_API_URL` from env.

```typescript
const BASE = import.meta.env.VITE_API_URL

export const api = {
  journal: {
    getToday: () => fetch(`${BASE}/journal/today`).then(r => r.json()),
    sendMessage: (content: string) => fetch(`${BASE}/journal/message`, { method: "POST", body: JSON.stringify({ content }) ... }),
    complete: () => fetch(`${BASE}/journal/complete`, { method: "POST" }).then(r => r.json()),
  },
  goals: {
    list: () => ...,
    create: (title, type) => ...,
    update: (id, title) => ...,
    delete: (id) => ...,
  },
  stats: { get: () => ... },
  home: { get: () => ... },
}
```

All requests set `Content-Type: application/json`. All responses typed against the schema interfaces.

### Pages

#### `pages/Home.tsx`

Implements `prd.md > Home & Journey Visualization`.

- On mount: calls `statsStore.loadHome()`.
- Renders `<PathVisualization />` with milestone data from `statsStore`.
- Empty state (no milestones): renders the path/road visually with a warm message ("Your journey begins here — start journaling to unlock milestones").

#### `pages/Journal.tsx`

Implements `prd.md > Daily Journaling Session`.

- On mount: calls `journalStore.loadToday()`.
- **If `status === "active"`:** renders `<ChatWindow />` + `<MessageInput />` + "End Session" button.
- **If `status === "completed"`:** renders `<ChatWindow />` in read-only mode (no input, no button) + `<DebriefScreen />` with debrief data.
- **If `status === "idle"`:** loading spinner.
- Shows `<ErrorBanner error={error} />` when `journalStore.error` is set.
- "End Session" button calls `journalStore.completeSession()` → shows loading state → on success, re-renders with debrief.

#### `pages/Goals.tsx`

Implements `prd.md > Goal Setting`.

- On mount: calls `goalStore.loadGoals()`.
- Renders two `<GoalSection>` components: one for `short_term`, one for `long_term`.
- Each section has an `<AddGoalInput />` inline (single text field + add button).
- Renders `<GoalCard />` for each goal.

#### `pages/Progress.tsx`

Implements `prd.md > Progress Dashboard`.

- On mount: calls `statsStore.loadStats()`.
- Renders XP total and streak count as `<StatCard />` components.
- Renders five `<TraitScoreCard />` components (one per trait).
- Trait scores update silently — no animation, no pop-up.

### Components

**`TabBar.tsx`** — Persistent bottom navigation. Four tabs with icons + labels. Active tab highlighted with Tailwind accent color. Calls `setActiveTab` on press.

**`ChatWindow.tsx`** — Scrollable list of `<MessageBubble />` components. Auto-scrolls to latest message. Accepts `messages[]` and `readOnly` props.

**`MessageBubble.tsx`** — Renders one message. AI messages: left-aligned, rounded, light background. User messages: right-aligned, accent color background. Props: `role`, `content`.

**`MessageInput.tsx`** — Text input + send button. Disabled when `journalStore.isLoading`. Calls `journalStore.sendMessage(content)` on submit (Enter key or button click). Shows loading spinner on button while waiting.

**`DebriefScreen.tsx`** — Post-entry summary. Implements `prd.md > Post-Entry Debrief`.
- Renders `<WeeklyStreakBar />` at top.
- Renders AI feedback sections: Strengths, Areas to Improve, Suggestions.
- Renders Goal Connections section only if `debrief.goal_connections !== null`.
- XP awarded displayed prominently (e.g., "+15 XP").

**`WeeklyStreakBar.tsx`** — Seven circles (Mon–Sun). Filled/colored for days journaled, empty for days missed. Derived from `debrief.weekly_streak: boolean[]`.

**`PathVisualization.tsx`** — Implements `prd.md > Home & Journey Visualization`. Renders two vertical columns of milestone cards (one column per goal type: short-term, long-term). Each column is styled as a road/path (connecting line between nodes). Milestone nodes are rounded cards with the label. Empty state: shows the path lines with no nodes and a prompt message. **No SVG in v1 — styled divs connected by a vertical line using Tailwind.**

**`GoalSection.tsx`** — Renders a labeled section (e.g., "Short-Term Goals") containing a list of `<GoalCard />` components and an `<AddGoalInput />`.

**`GoalCard.tsx`** — Renders a single goal title with edit (pencil icon) and delete (trash icon) actions. Edit toggles an inline text input. Calls `goalStore.updateGoal()` on save, `goalStore.deleteGoal()` on delete confirmation.

**`AddGoalInput.tsx`** — Single text field + "Add" button. Calls `goalStore.createGoal(title, type)` on submit. Clears input on success.

**`StatCard.tsx`** — Displays a label + value in a styled card. Used for XP and streak.

**`TraitScoreCard.tsx`** — Displays trait name + current score. Five instances in Progress tab. Simple text display — no progress bar in v1.

**`ErrorBanner.tsx`** — Dismissible error message bar. Shown when `store.error` is set. Calls `store.clearError()` on dismiss.

---

## Data Model

### JournalEntry
| Field | Type | Notes |
|---|---|---|
| id | int (PK) | auto |
| date | date | unique — one row per calendar day |
| messages | str | JSON array of `{role, content}` objects |
| completed | bool | false while session active, true after /complete |
| xp_awarded | int | set by AI analysis on completion |
| created_at | datetime | UTC |

### Goal
| Field | Type | Notes |
|---|---|---|
| id | int (PK) | auto |
| title | str | only required field |
| type | str | "short_term" or "long_term" |
| created_at | datetime | UTC |

### TraitScore
| Field | Type | Notes |
|---|---|---|
| id | int (PK) | auto |
| trait | str | one of five trait names |
| score | int | unbounded, starts at 0, incremented by AI deltas |

Seeded with 5 rows on first startup. Updated in place — never replaced.

### UserStats
| Field | Type | Notes |
|---|---|---|
| id | int (PK) | singleton row |
| xp_total | int | accumulates across all entries |
| streak_count | int | reset to 0 if a day is missed |
| last_journaled_date | date or null | used by streak service to compute current streak |

Seeded with 1 row on first startup.

### PathMilestone
| Field | Type | Notes |
|---|---|---|
| id | int (PK) | auto |
| goal_id | int (FK → Goal) | cascade delete when goal deleted |
| label | str | AI-generated milestone description |
| order | int | display order within a goal's branch |
| created_at | datetime | UTC |

---

## File Structure

```
level-up/
├── backend/
│   ├── main.py                  # FastAPI app, CORS config, router registration, startup seed
│   ├── database.py              # SQLModel engine + get_session() dependency
│   ├── models.py                # JournalEntry, Goal, TraitScore, UserStats, PathMilestone
│   ├── schemas.py               # Pydantic request/response types
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── journal.py           # GET /journal/today, POST /journal/message, POST /journal/complete
│   │   ├── goals.py             # CRUD /goals
│   │   ├── stats.py             # GET /stats
│   │   └── home.py              # GET /home
│   ├── services/
│   │   ├── __init__.py
│   │   ├── claude.py            # Anthropic SDK: get_opening_message, send_message, analyze_entry
│   │   └── streak.py            # update_streak() logic
│   ├── requirements.txt         # fastapi, uvicorn, sqlmodel, anthropic, python-dotenv
│   └── .env                     # ANTHROPIC_API_KEY, DATABASE_URL, FRONTEND_URL
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx             # ReactDOM.createRoot entry point
│   │   ├── App.tsx              # Tab navigation shell
│   │   ├── types.ts             # Shared TypeScript interfaces (Goal, Message, DebriefResponse, etc.)
│   │   ├── stores/
│   │   │   ├── journalStore.ts  # status, messages, debrief, isLoading, error
│   │   │   ├── goalStore.ts     # goals[], CRUD actions
│   │   │   └── statsStore.ts    # xp, streak, traitScores, milestones
│   │   ├── api/
│   │   │   └── client.ts        # Typed fetch wrappers for all backend endpoints
│   │   ├── pages/
│   │   │   ├── Home.tsx         # Path visualization (two columns of milestone cards)
│   │   │   ├── Journal.tsx      # Chat UI + session gating + debrief render
│   │   │   ├── Goals.tsx        # Short-term + long-term goal sections
│   │   │   └── Progress.tsx     # XP, streak, five trait score cards
│   │   └── components/
│   │       ├── TabBar.tsx              # Bottom tab navigation
│   │       ├── ChatWindow.tsx          # Scrollable message list
│   │       ├── MessageBubble.tsx       # Single chat message (AI vs user styles)
│   │       ├── MessageInput.tsx        # Text input + send button with loading state
│   │       ├── DebriefScreen.tsx       # Post-entry summary (streak bar + AI feedback + XP)
│   │       ├── WeeklyStreakBar.tsx      # Mon–Sun circles, filled = journaled
│   │       ├── PathVisualization.tsx   # Two-column milestone card path (styled divs, no SVG)
│   │       ├── GoalSection.tsx         # Labeled section with GoalCard list + AddGoalInput
│   │       ├── GoalCard.tsx            # Single goal with inline edit + delete
│   │       ├── AddGoalInput.tsx        # Text field + Add button
│   │       ├── StatCard.tsx            # Label + value card (XP, streak)
│   │       ├── TraitScoreCard.tsx      # Trait name + score
│   │       └── ErrorBanner.tsx         # Dismissible error message
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json             # react, react-dom, zustand, tailwindcss, typescript, vite
│
├── docs/
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md                  # this file
├── process-notes.md
└── README.md
```

---

## Key Technical Decisions

**1. SQLite local / PostgreSQL production (via SQLModel)**
Decided to develop with SQLite (zero config) and deploy against Railway PostgreSQL. SQLModel + SQLAlchemy handle both via `DATABASE_URL` environment variable — no code changes needed. Tradeoff accepted: slightly different behavior at the edge (SQLite is more lenient with types). For a single-user app this is not a risk.

**2. All AI logic behind `POST /journal/complete`**
Rather than streaming analysis incrementally, the full analysis fires in one call when the session closes. This simplifies the frontend (one API call → one debrief response) and makes the data update atomic (XP, traits, streak, milestones all update together). Tradeoff: if the Claude call is slow, the user waits after clicking "End Session." Mitigated by showing a loading state with a message like "Analyzing your session…"

**3. Simplified path visualization (styled divs, not SVG)**
The home path is implemented as two vertical lists of milestone cards connected by a CSS line — not a custom SVG. This is buildable in the hackathon time constraint. Tradeoff: less visually dramatic than a true path. Flagged as an upgrade target if time allows.

**4. Structured JSON contract for AI analysis**
The analysis prompt instructs Claude to return only valid JSON with a fixed schema. Parsed with `json.loads()` on the backend. This keeps the frontend/database update logic deterministic. Tradeoff: Claude occasionally fails to return clean JSON — handled by returning HTTP 503 and letting the user retry.

---

## Dependencies & External Services

| Service | Purpose | Pricing / Limits | Docs |
|---|---|---|---|
| Anthropic Claude API | Journaling AI + post-entry analysis | Pay-per-token. claude-sonnet-4-6 is cost-efficient for this use case. Set a spend limit in Anthropic console. | https://platform.claude.com/docs |
| Railway | FastAPI hosting + PostgreSQL | Free trial available; usage-based after. PostgreSQL: free tier included. | https://railway.app/pricing |
| Vercel | React/Vite hosting | Free tier: unlimited personal projects, 100GB bandwidth/month. | https://vercel.com/pricing |

**Environment variables needed:**
- `ANTHROPIC_API_KEY` — from https://platform.claude.com/settings/keys
- `DATABASE_URL` — provided by Railway PostgreSQL plugin automatically
- `FRONTEND_URL` — Vercel deployment URL (for CORS)
- `VITE_API_URL` — Railway backend URL (set in Vercel env vars)

---

## Open Issues

**1. Streak timezone:** The streak service uses server-side UTC date. If the user journals at 11pm their local time, the UTC date may already be the next day, potentially breaking streak calculation. Acceptable for v1 (single user, James controls when he journals), but worth noting for future multi-user work.

**2. PathMilestone accumulation:** The AI generates new milestone nodes on every journal entry. Over time, the path could accumulate many stale nodes. No pruning logic is specified in v1 — milestones append only. If the path becomes cluttered during testing, the simplest fix is adding a `DELETE /home/milestones/{id}` endpoint.

**3. First-run seeding:** `main.py` must seed `UserStats` (1 row) and `TraitScore` (5 rows) on startup if the tables are empty. SQLModel `create_all()` creates the tables; the seeding logic needs to be an explicit startup event. A missing seed will cause `GET /stats` to return empty data.
