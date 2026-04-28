# Level Up

## Idea
A gamified daily journal and goal tracker where an AI coach reads what you write, connects it to your personal goals, and tells you how to reorient your life to level up as a person.

## Who It's For
James — a working developer who finds traditional journaling tedious and wants something that makes him genuinely excited to open the app every day. Eventually: anyone who struggles to maintain a journaling habit because it feels like a chore and doesn't give them tangible feedback.

## Inspiration & References

**Design north star:**
- [Duolingo](https://duolingo.com) — clean, cute UI, daily streak mechanics, habit loops, optimistic energy. The gold standard for making repetitive behavior feel rewarding.

**Gamification mechanics:**
- [Habitica](https://habitica.com) — RPG-style stat progression and character building. James likes the *mechanics* (stats, progression, leveling up) but not the pixel art visual style.

**AI journaling:**
- [Rosebud](https://www.rosebud.app) — adaptive AI prompts that respond to what you actually wrote. The closest existing product to the "AI asks you questions" interaction model James wants.

**Aesthetic references:**
- Nintendo RPGs (Pokémon, Zelda, Kirby) — friendly, warm, slightly whimsical. Not dark or gritty.
- Marcus Aurelius / Stoic philosophy — the character trait system is inspired by *Meditations* and Myers-Briggs personality dimensions.

**Design energy:** Bright colors, clean, cute, optimistic, high-spirited. Joyful, not serious.

## Goals
- Build a daily journaling habit that feels fun, not like a chore
- See tangible progress toward personal goals over time
- Get honest, actionable AI feedback that reorients behavior — not task lists, but directional life coaching
- Track growth along meaningful personal character traits
- Lay the foundation for a product James can test for several weeks and eventually scale to other users

## What "Done" Looks Like
After 3-4 hours of building, the app can:
1. Let the user write a daily journal entry, guided by AI-generated adaptive prompts that respond to what they write
2. Let the user set personal goals (short-term and long-term) — not deadlines, but directional north stars
3. Analyze each journal entry and surface concrete suggestions: what the user is doing well, what to do differently, and how their actions connect to their goals
4. Show a basic gamification layer: streak counter, XP that accumulates with each entry, and 5 character traits (Stoicism, Resilience, Patience, Action-Orientation, Critical Thinking) that increment based on AI analysis of journal entries
5. Present all of this in a clean, bright, optimistic UI that feels good to open

## What's Explicitly Cut
- **Mobile app** — web only for the hackathon build
- **Multi-user support** — single user (James), no auth complexity
- **Notifications / reminders** — out of scope for v1
- **Social features** — no sharing, no community, no comparisons
- **Complex RPG animations** — no gear drops, no battle sequences, no elaborate level-up cinematics. Simple visual feedback only.
- **Long-term analytics / charts** — no trend graphs or historical dashboards in v1
- **Voice input** — text only
- **Hard goal deadlines / milestones** — goals are compass directions, not tasks with due dates
- **Settings / customization** — no theming, no profile management

## Loose Implementation Notes
- **Stack:** FastAPI (Python) backend, React + TypeScript + Vite frontend — James's native stack
- **AI layer:** Claude API for adaptive journaling prompts and journal-to-goal analysis
- **Data model:** Users → Goals → Journal Entries → AI Analysis + Trait deltas
- **Gamification:** Streak tracked per calendar day, XP per entry, trait scores stored as integers and incremented by AI analysis output
- **Prompting approach:** AI leads the journaling session (asks one question at a time, adapts based on response), then synthesizes a post-entry insight with suggestions and trait updates
