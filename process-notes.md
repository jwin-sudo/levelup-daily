# Process Notes

## /onboard

**Technical experience:** Working software developer at Infosys. FastAPI/Python backend, React/TypeScript/Vite frontend. Intermediate-to-experienced level. Used GitHub Copilot (plan mode + agent mode) — understands tool calling at a conceptual level.

**Learning goals:** Understand agentic workflows end-to-end; see how a solo dev can run/scale a product using AI; potential future monetization in mind.

**Creative sensibility:** Duolingo (the north star — streaks, XP, daily habits), Hearthstone (card progression, incremental unlocks), Nintendo RPG games (Pokémon, Zelda, Kirby — friendly, whimsical aesthetic). Very strong design references that map directly to his project idea.

**Prior SDD experience:** Yes — used Copilot plan mode to generate markdown plans before building, then handed off to agent mode. Informal but genuine prior exposure. Calibrate /reflect quiz for depth, not basics.

**Energy and engagement:** High. Came in with a clear project idea (gamified journal + goal tracker), articulate about what he wants to learn, and already thinking about scale and monetization. Ready to move fast.

## /scope

**How the idea evolved:** James arrived with a clear concept (gamified journal + goal tracker) but the conversation sharpened it significantly. The key evolution: it's not a habit tracker or a therapy app — it's an AI life coach that reads your journal and tells you how to reorient your behavior to level up as a person. The "reorientation, not task completion" framing emerged in the deepening rounds and became the differentiator.

**Pushback received:** Pushed hard on cutting scope for the hackathon. James responded well — he clarified the core (AI feedback + daily journal + goal connection) and let go of complexity without resistance.

**References that resonated:** Habitica (mechanics yes, pixel art no), Rosebud (AI prompt quality), Duolingo (daily habit feel + clean cute UI), Nintendo RPGs (friendly whimsical aesthetic), Marcus Aurelius / Meditations (character trait inspiration).

**App name:** Went through "Level Up" → considered "Solo Leveling" (IP issue flagged) → alternatives offered → landed back on "Level Up."

**Character traits:** Stoicism, Resilience, Patience, Action-Orientation, Critical Thinking — inspired by Marcus Aurelius and Myers-Briggs. These grow as the AI analyzes journal entries.

**Deepening rounds:** 2 rounds. Round 1 surfaced visual aesthetic (bright, cute, optimistic, Duolingo/Nintendo) and character traits. Round 2 surfaced the core differentiator ("reorient your life, not complete tasks"), the trait names from Stoic philosophy, and the app name.

**Active shaping:** James drove most of the direction. He pushed back on Habitica's visual, rejected hard goal deadlines in favor of compass-direction goals, and brought in his own references (Marcus Aurelius, Myers-Briggs, Solo Leveling). Strong ownership throughout.

## /prd

**What the learner added vs. scope doc:** The scope sketched "daily journaling + goals + gamification." The PRD surfaced the actual navigation structure (4 tabs: Home, Journal, Goals, Progress), the chat-style journaling UX, the post-entry debrief screen as a distinct concept, the living path visualization on home, and the branching AI behavior (goal-aware vs. standard journaling). None of these details existed in the scope.

**"What if" moments that landed:** (1) What if no goals are set? — James decided cleanly: AI just journals, no goal analysis. (2) What if the user already journaled today? — show the previous conversation read-only, no second entry. (3) What if the user misses a day? — streak resets to zero, no exceptions. These were genuine decision moments, not confirmations of things already assumed.

**Pushback / strong opinions:** James held firm on simplicity — goals are title-only, one entry per day, traits update quietly with no animation. Pushed back on complexity at every turn. The core insight from the conversation: "daily journaling is the most important part" — everything else serves that.

**Scope guard conversations:** No real scope creep surfaced. The 4-tab structure was accepted without additions. Deferred: XP leveling thresholds, goal completion state, streak freeze mechanic, path node interactivity, trait history. All cleanly moved to "What We'd Add With More Time."

**Deepening rounds:** 0 rounds. James declined and asked to generate the doc after the mandatory questions. The mandatory phase was thorough enough — key decisions were surfaced without needing extra rounds.

**Active shaping:** James was decisive and consistent throughout. He drove the "simple by design" philosophy (title-only goals, no animations, quiet trait updates). The key architectural decision — AI branches between goal-aware and standard journaling — came from James, not prompted by the agent. Strong ownership.

## /spec

**Technical decisions made:**
- SQLite (local dev) + PostgreSQL (Railway prod) via SQLModel — zero config locally, transparent switch via DATABASE_URL env var
- Zustand v5 for cross-tab state (journalStore, goalStore, statsStore)
- Tailwind CSS v4 for styling
- Deployment: Vercel (frontend) + Railway (backend + Postgres)
- All AI analysis fires in one call at `POST /journal/complete` — atomic update, simpler frontend
- Structured JSON contract for Claude analysis response — parsed server-side, HTTP 503 on parse failure
- Path visualization: styled div columns (no SVG) — flagged as upgrade target if time allows

**Open questions resolved:**
- XP: variable, AI determines based on entry depth (5–25 range)
- Trait scores: unbounded integers, seeded at 0
- Home path: two separate branches (short-term / long-term) rendered as two vertical milestone card columns
- Session-ending signal: explicit "End Session" button (not natural language detection)
- Empty debrief goal section: omitted entirely when no goals set

**What James was confident about:** Stack choices (his native FastAPI + React/TypeScript/Vite). Simplicity-first instincts held throughout. Pushed back on SVG path in favor of styled divs.

**What James was uncertain about:** The AI analysis JSON contract — needed help structuring it. Deferred to the agent on the Claude system prompt strategy and context window approach.

**Deepening rounds:** 1 round. Surfaced: the AI analysis JSON contract, explicit "End Session" button decision, Claude system prompt context strategy (last 7 debrief summaries, not raw chat logs), and error handling approach (loading states + error messages, no fallback data).

**Active shaping:** James was decisive on the key UX decisions (explicit end button, loading states, no fake fallback data). Deferred to agent on the AI prompt architecture and JSON contract structure. The "last 7 debriefs as summaries not raw logs" was an agent proposal James accepted — he framed his preference as "more and concise the better," which confirmed the approach.

## /build

### Step 12: Deployment — Railway (backend) + Vercel (frontend)

**What was built:** Backend deployed to Railway with PostgreSQL plugin. Frontend deployed to Vercel with root directory set to `frontend/`. Code prep: added `psycopg2-binary` to `requirements.txt`, added `postgresql://` → `postgresql+psycopg2://` URL fix in `database.py`, created `backend/Procfile` with `uvicorn main:app --host 0.0.0.0 --port $PORT`. Live URLs: Railway backend at `https://levelup-daily-production.up.railway.app`, Vercel frontend at `https://levelup-daily-eight.vercel.app`.

**Issues encountered:** Two in sequence. (1) CORS errors on first load — `FRONTEND_URL` hadn't been set on Railway yet, so the middleware was only allowing `localhost:5173`. Fixed by setting `FRONTEND_URL=https://levelup-daily-eight.vercel.app` in Railway Variables. (2) 503 on `/journal/today` after CORS was resolved — `ANTHROPIC_API_KEY` needed to be confirmed on Railway. Once confirmed present, the full stack worked.

**Verification:** Learner confirmed Journal tab loads the AI opening message on the live Vercel URL with no CORS errors.

**Comprehension check:** Asked why setting `FRONTEND_URL` on Railway fixed the CORS error without a code change. Learner answered D ("CORS is handled by the browser, the env var just triggered a redeploy"). Incorrect. Explained: CORS is enforced server-side — `main.py` reads `FRONTEND_URL` at startup to build the `CORSMiddleware` allowlist. The code was already written correctly; the env var just needed the right value in the Railway environment.

---

### Step 11: Home page and path visualization

**What was built:** `PathVisualization.tsx` (two-column layout — green for short-term, purple for long-term — each column has a vertical line, a start node circle, and rounded milestone cards stacked above the line as z-10 elements; empty state message renders below both columns when neither has milestones). `Home.tsx` updated from stub: calls `loadHome()` on mount, renders a header + `PathVisualization` with milestones from statsStore. TypeScript check passed clean.

**Issues encountered:** None.

---

### Step 10: Progress page

**What was built:** `StatCard.tsx` (label + large value in a colored card — green for XP, orange for streak), `TraitScoreCard.tsx` (trait name left, score right in a white card), `Progress.tsx` (calls `loadStats()` on mount, two-column StatCard grid at top, then five TraitScoreCards in a labeled section with a canonical trait order: Stoicism, Resilience, Patience, Action-Orientation, Critical Thinking). TypeScript check passed clean.

**Verification:** Learner confirmed XP total, Day Streak, and all five character traits visible on the Progress tab.

**Comprehension check:** Asked why `Progress.tsx` iterates over a hardcoded `TRAITS` array instead of `Object.entries(trait_scores)`. Learner answered "A — to guarantee consistent display order." Correct.

**Issues encountered:** None.

---

### Step 9: Goals page

**What was built:** `AddGoalInput.tsx` (text field + Add button, clears on success, Enter key submits, disabled when empty), `GoalCard.tsx` (read view with ✏️/🗑️ icons toggles to inline edit view; draft title in local state so Cancel is zero-cost), `GoalSection.tsx` (labeled section with emoji header, empty state message, GoalCard list, AddGoalInput at bottom), and `Goals.tsx` (loads goals on mount, filters flat store array into short_term/long_term at render time, renders two GoalSection components with spinner while loading).

**Verification:** Learner confirmed expected behavior — goals appear in correct sections, inline edit works, delete removes from list, changes persist on page refresh.

**Comprehension check:** Asked why GoalCard keeps draft title in local state rather than writing to the store on each keystroke. Learner answered "A — local state lets Cancel restore the original title without any API call or store update." Correct.

**Issues encountered:** None. TypeScript check passed clean on first build.

---

### Step 8: Debrief screen

**What was built:** `WeeklyStreakBar.tsx` (seven Mon–Sun circles, green-filled for journaled days, gray for missed, derived from `debrief.weekly_streak: boolean[]`), `DebriefScreen.tsx` (XP awarded prominently in large green text, WeeklyStreakBar, three AI feedback cards — Strengths/Areas to Improve/Suggestions for Tomorrow — and a conditional Goal Connections card when `goal_connections !== null`). Added `compact` prop to `ChatWindow.tsx` (swaps `flex-1 overflow-y-auto` for `max-h-48 overflow-y-auto` so the chat history sits compactly above the debrief in the completed state). Updated `Journal.tsx`: completed state now wraps ChatWindow (compact) + DebriefScreen in a `flex-1 overflow-y-auto` container; added `useEffect` that watches `debrief` and calls `statsStore.applyDebrief(debrief)` when it becomes non-null (cross-tab XP sync without page refresh). Also fixed "Loading debrief…" fallback to show a proper "You've journaled today! Come back tomorrow." message for sessions completed in a prior browser session.

**Issues encountered:** DB had a completed entry from step 7 testing — user couldn't reach the active state to test End Session. Deleted the entry to reset. Also fixed the `loadToday()` → `status: completed` → `debrief: null` case, which was showing misleading "Loading debrief…" text.

**Verification:** Learner confirmed the debrief screen looks good.

**Comprehension check:** Asked what makes the Progress tab show updated XP after session completion without a page refresh. Learner answered "C — Progress tab re-fetches GET /stats automatically on tab switch." Incorrect. Explained: Progress calls `loadStats()` only on mount. The cross-tab sync comes from `Journal.tsx`'s `useEffect` watching `debrief` — when debrief becomes non-null, it calls `statsStore.applyDebrief(debrief)` to update in-memory state immediately.

---

### Step 7: Journal page and chat components

**What was built:** `ChatWindow.tsx` (scrollable message list, auto-scrolls to latest via `useRef`, accepts `messages[]` + `readOnly` props), `MessageBubble.tsx` (AI messages left-aligned white bubble, user messages right-aligned green bubble), `MessageInput.tsx` (textarea + send button, `disabled={isLoading}`, spinner on button while waiting, submits on Enter or click), `ErrorBanner.tsx` (dismissible error bar with `×` button). `Journal.tsx` wired up: `loadToday()` on mount, `idle` → spinner, `active` → ChatWindow + MessageInput + End Session button (disabled until ≥2 messages), `completed` → read-only ChatWindow.

**Issues encountered:** Layout fix required — `main` in `App.tsx` had `overflow-y-auto` which let the full page scroll, pushing the input below the fold. Fixed by changing `main` to `overflow-hidden` so ChatWindow's internal `flex-1 overflow-y-auto` constrains properly. Also: today's DB entry was marked `completed` from step 4 testing — deleted it so a fresh active session could load for verification.

**Verification:** Learner confirmed back-and-forth chat interaction visible in the Journal tab with AI opening message, user messages right-aligned, AI replies left-aligned.

**Comprehension check:** Asked what prevents a second message from being sent while Claude is generating a reply. Learner answered "A — MessageInput.tsx, it disables the send button and textarea when journalStore.isLoading is true." Correct.

---

### Step 6: Frontend scaffold — Vite, App shell, stores, API client

**What was built:** Vite + React + TypeScript project scaffolded in `frontend/`. Tailwind CSS v4 installed via `@tailwindcss/vite` plugin (registered in `vite.config.ts`; CSS imported via `@import "tailwindcss"` in `index.css`). Dependencies: `zustand@5`, `tailwindcss`, `@tailwindcss/vite`. Created `src/types.ts` with five interfaces: `Message`, `Goal`, `Milestone`, `DebriefResponse`, `StatsResponse`, `HomeResponse`. Created `src/api/client.ts` — typed fetch wrappers for all backend endpoints (journal: getToday/sendMessage/complete, goals: list/create/update/delete, stats: get, home: get), reads `VITE_API_URL` from env. Created all three Zustand stores with full API wiring: `journalStore.ts` (status, messages, debrief, isLoading, error — loadToday/sendMessage/completeSession/clearError), `goalStore.ts` (goals array, CRUD actions), `statsStore.ts` (xp_total, streak_count, trait_scores, milestones — loadStats/loadHome/applyDebrief). Rewrote `App.tsx` with local tab navigation state rendering four placeholder pages. Created `TabBar.tsx` with four tabs (Home, Journal, Goals, Progress), emoji icons, active tab highlighted in green. Created `frontend/.env` with `VITE_API_URL=http://localhost:8000`. Stub pages created for all four tabs.

**Issues encountered:** None. TypeScript type check passed clean. Vite production build succeeded (21 modules, 191KB JS, 8.6KB CSS).

---

### Step 5: Goals, stats, and home routers

**What was built:** `routers/goals.py` — four endpoints: `GET /goals` (returns goals grouped by type as `{short_term: [...], long_term: [...]}`), `POST /goals` (201 + returns created goal), `PATCH /goals/{id}` (title update, 404 if not found), `DELETE /goals/{id}` (204 — explicitly queries and deletes associated `PathMilestone` rows before deleting the goal to prevent orphaned milestone accumulation). `routers/stats.py` — single `GET /stats` returning `StatsResponse` with XP, streak, and all five trait scores as a dict. `routers/home.py` — single `GET /home` returning milestones split into `short_term_milestones` and `long_term_milestones`, sorted by `order`, joined with goal type via in-memory dict lookup.

**Verification:** Passed. All five endpoints confirmed working via Swagger UI — goals created, listed by type, renamed, deleted; stats returned seeded values; home returned empty milestone arrays.

**Comprehension check:** Asked why DELETE /goals explicitly deletes PathMilestone rows. Learner answered "GET /home would crash" — incorrect. Explained: `goals.get(m.goal_id)` returns None for a deleted goal, and the `if goal and ...` check silently skips it — no crash, just silent orphan accumulation. The correct answer is that orphaned rows persist indefinitely as stale dead weight.

**Issues encountered:** None. All three routers matched spec on first run.

---

### Step 4: Journal router — analysis and atomic completion

**What was built:** `POST /journal/complete` added to `routers/journal.py`. Marks `completed=True` and commits immediately (before calling Claude) so the entry is never left in an open state on failure. Calls `claude.analyze_entry` — re-raises HTTP 503 on failure. On success: applies XP, streak, trait deltas, and path milestones in one `session.commit()`. Key ordering decision: `streak.update_streak(stats)` is called before `stats.last_journaled_date = today` — the streak function reads the old date to determine consecutive/reset logic; setting today first would cause it to silently no-op every time. Weekly streak built by querying `JournalEntry` rows in the Mon–Sun window after committing, so today's entry is included.

**Verification:** Passed. Full test sequence (GET /today → POST /message → POST /complete) returned a valid `DebriefResponse`: `xp_awarded: 8`, all three feedback sections populated, `trait_deltas` correct (resilience: 1, action_orientation: 2, critical_thinking: 1), `goal_connections: null` (no goals set), `streak_count: 1`, `weekly_streak` with Tuesday (index 1) set to true.

**Comprehension check:** Asked why `update_streak` is called before setting `last_journaled_date`. Learner answered correctly: "update_streak reads the old date to decide if today is consecutive." Correct — if you set the date to today first, the function always hits the `last == today` branch and does nothing.

**Issues encountered:** None. Endpoint behavior matched spec on first run.

---

### Step 3: Journal router — conversational loop

**What was built:** `routers/journal.py` with two endpoints. `GET /journal/today`: queries today's `JournalEntry` by date — creates one (calling `claude.get_opening_message`) if none exists, otherwise returns the existing session. Returns `{status: "active"|"completed", messages: [...]}`. `POST /journal/message`: appends user message, calls `claude.send_message`, appends AI reply, persists the updated message list, returns `MessageResponse`. Both endpoints return HTTP 503 on Claude failure. Completed sessions return 400 on `POST /message` (not 404 — the entry exists, the request is invalid). `recent_debriefs` passed as empty list for now (debrief storage not yet implemented — Step 4).

**Verification:** Passed. Learner confirmed `GET /journal/today` returned `status: "active"` with the AI opening message. `POST /journal/message` with "I have a great day today!" returned an AI reply ("That's wonderful to hear! 😊 What made it so great?"). Second call to `GET /journal/today` returned the full 3-message history — session correctly preserved, not reset.

**Comprehension check:** Asked why `POST /journal/message` returns 400 (not 404) when the entry is completed. Learner answered "400 is the default for any error" — incorrect. Explained: 404 = resource not found; 400 = resource exists but the request is invalid given its state. Completed sessions exist in the DB; sending a message to one is a bad request, not a missing resource.

**Issues encountered:** None. Endpoint behavior matched spec on first run.

---

### Step 2: Claude + streak services

**What was built:** `services/claude.py` — Anthropic SDK wrapper with `_build_system_prompt` (injects goals, stats, last 7 debrief summaries), `get_opening_message`, `send_message`, and `analyze_entry`. Added `_build_analysis_system_prompt` (strict JSON-only system prompt) to give Claude a separate, minimal system prompt for the analysis call — separating coaching context from structured output extraction. JSON extraction uses `{...}` boundary detection to handle any leading/trailing text Claude adds. `services/streak.py` — pure date math: None/missed-day → 1, yesterday → increment, today → no change.

**Issues encountered:** Initial `analyze_entry` raised HTTP 503 due to Claude wrapping JSON in explanation text. Fixed in two steps: (1) added `{...}` boundary extraction to handle leading/trailing text, (2) user/linter added `_build_analysis_system_prompt` to give the analysis call a strict JSON-only system prompt rather than the coaching prompt. Both fixes together make JSON extraction robust.

**Verification:** Passed. `analyze_entry` returned a valid dict with all 7 required keys. `xp_awarded: 5`, `trait_deltas` correct shape, `goal_connections: None` (no goals passed), `path_milestones: []`.

**Comprehension check:** Asked what `update_streak` returns when `last_journaled_date` is None. James answered "Returns 0" — incorrect. Explained: the `if last is None or last < yesterday` branch sets `streak_count = 1`, treating first-ever journal the same as a missed-day reset. The 0 case never occurs in practice.

---

### Step 1: Backend foundation — DB, models, schemas, main.py

**What was built:** Created the full backend skeleton: `database.py` (SQLModel engine + `get_session()` dependency), `models.py` (5 table classes: JournalEntry, Goal, TraitScore, UserStats, PathMilestone), `schemas.py` (all Pydantic request/response shapes), router stubs for journal/goals/stats/home, `services/__init__.py`, `main.py` (FastAPI app, CORS from env, lifespan startup that creates tables and seeds 1 UserStats row + 5 TraitScore rows), `requirements.txt`, and `.gitignore`.

**Issues encountered:** Pydantic v2 naming clash — the field `date: date` in `JournalEntry` shadowed the `date` type from the `datetime` module. Fixed by aliasing the import as `from datetime import date as Date`. Python 3.13 + SQLModel 0.0.38 appears to be strict about this.

**Verification:** Passed. Learner confirmed one UserStats row and five TraitScore rows present in DB. Uvicorn started cleanly.

---

## /checklist

**Sequencing decisions:** Backend-first (James's instinct). Within backend: foundation layer (DB + models + schemas + main.py) first because all routers depend on it. Claude + streak services before journal router because journal router imports both. Journal router before other routers because it's the riskiest piece — surfacing any Claude/DB issues early while there's time to pivot. Goals/stats/home routers last on backend (simple CRUD, fast to build). Frontend follows the same logic: scaffold + stores before any pages, journal (core experience) before debrief, goals, progress, and home.

**Methodology preferences:** Step-by-step mode. Comprehension checks: yes. Verification: yes (run and confirm after each item). Git: commit after each step. Check-in cadence: learning-driven (full discussion after each step).

**Final item count:** 13 items. Estimated total build time: 4–5 hours at a learning-driven pace. Backend items (1–5): ~1.5–2 hrs. Frontend items (6–11): ~2–2.5 hrs. Deployment (12): ~30–45 min. Devpost (13): ~30 min.

**What James was confident about:** Backend sequencing — he immediately said "start with backend" without hesitation. Stack choices and project structure. GitHub repo already set up (`jwin-sudo/levelup-daily`).

**What James needed guidance on:** What "natural starting point" meant within the backend (needed the dependency explanation). Build mode — chose step-by-step for the learning value after the two options were presented.

**Submission planning:** Core story — struggles with tracking progress against short/long-term goals; app is a Life Coach + daily journal to help become the person he wants to be. Screenshots planned: chat interface, debrief screen, goals tab, home path/milestones. Wow moment: the debrief screen (AI analysis mapped to goals + XP + character traits in one view). Deployment included (Railway + Vercel). GitHub repo already exists.

**Deepening rounds:** 2 rounds. Round 1 surfaced: (1) split journal router into two items (conversational loop vs. analysis + atomic update) — item 3 was too big for one session, (2) explicit CORS verification step added to deployment item, (3) split Progress and Home pages into separate items — PathVisualization has more design work than the rest of Progress, (4) API connectivity check added to frontend scaffold item. Round 2 surfaced: (5) PathVisualization verify step now includes explicit prerequisite (set goals, complete a session, then check Home), (6) POST /journal/complete verify now spells out the full test sequence (GET /today → POST /message → POST /complete → check DB), (7) analyze_entry() JSON contract smoke test added to Claude services item, (8) applyDebrief() cross-tab wiring check added to debrief screen item (switch to Progress tab after session and confirm XP updated without refresh).

**Active shaping:** James was decisive on build mode (chose step-by-step for learning) and check-in cadence (learning-driven — wants to understand the ins and outs). Accepted all sequencing proposals without pushback, which suggests strong alignment with the dependency reasoning. Engaged meaningfully with both deepening rounds — agreed to every sharpening suggestion rather than just accepting the initial draft. The checklist grew from 11 to 13 items through the deepening process, with each addition addressing a real build risk.
