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

## /checklist

**Sequencing decisions:** Backend-first (James's instinct). Within backend: foundation layer (DB + models + schemas + main.py) first because all routers depend on it. Claude + streak services before journal router because journal router imports both. Journal router before other routers because it's the riskiest piece — surfacing any Claude/DB issues early while there's time to pivot. Goals/stats/home routers last on backend (simple CRUD, fast to build). Frontend follows the same logic: scaffold + stores before any pages, journal (core experience) before debrief, goals, progress, and home.

**Methodology preferences:** Step-by-step mode. Comprehension checks: yes. Verification: yes (run and confirm after each item). Git: commit after each step. Check-in cadence: learning-driven (full discussion after each step).

**Final item count:** 13 items. Estimated total build time: 4–5 hours at a learning-driven pace. Backend items (1–5): ~1.5–2 hrs. Frontend items (6–11): ~2–2.5 hrs. Deployment (12): ~30–45 min. Devpost (13): ~30 min.

**What James was confident about:** Backend sequencing — he immediately said "start with backend" without hesitation. Stack choices and project structure. GitHub repo already set up (`jwin-sudo/levelup-daily`).

**What James needed guidance on:** What "natural starting point" meant within the backend (needed the dependency explanation). Build mode — chose step-by-step for the learning value after the two options were presented.

**Submission planning:** Core story — struggles with tracking progress against short/long-term goals; app is a Life Coach + daily journal to help become the person he wants to be. Screenshots planned: chat interface, debrief screen, goals tab, home path/milestones. Wow moment: the debrief screen (AI analysis mapped to goals + XP + character traits in one view). Deployment included (Railway + Vercel). GitHub repo already exists.

**Deepening rounds:** 2 rounds. Round 1 surfaced: (1) split journal router into two items (conversational loop vs. analysis + atomic update) — item 3 was too big for one session, (2) explicit CORS verification step added to deployment item, (3) split Progress and Home pages into separate items — PathVisualization has more design work than the rest of Progress, (4) API connectivity check added to frontend scaffold item. Round 2 surfaced: (5) PathVisualization verify step now includes explicit prerequisite (set goals, complete a session, then check Home), (6) POST /journal/complete verify now spells out the full test sequence (GET /today → POST /message → POST /complete → check DB), (7) analyze_entry() JSON contract smoke test added to Claude services item, (8) applyDebrief() cross-tab wiring check added to debrief screen item (switch to Progress tab after session and confirm XP updated without refresh).

**Active shaping:** James was decisive on build mode (chose step-by-step for learning) and check-in cadence (learning-driven — wants to understand the ins and outs). Accepted all sequencing proposals without pushback, which suggests strong alignment with the dependency reasoning. Engaged meaningfully with both deepening rounds — agreed to every sharpening suggestion rather than just accepting the initial draft. The checklist grew from 11 to 13 items through the deepening process, with each addition addressing a real build risk.
