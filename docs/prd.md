# Level Up — Product Requirements

## Problem Statement

People who want to build a journaling habit struggle to maintain it because traditional journaling is passive — you write into a void with no feedback, no visible progress, and no connection to the goals you actually care about. For working professionals who are achievement-oriented and respond well to game mechanics, a journaling app needs to give tangible daily feedback that makes the habit feel worth maintaining. Level Up solves this by making the AI do the coaching work: it leads the conversation, analyzes what you write against your goals, and shows you exactly how you're growing — in plain language, not just numbers.

---

## User Stories

### Epic: Home & Journey Visualization

- As a user, I want to see a visual path that represents my journey toward my goals, so that I get an immediate sense of where I am and where I'm headed.
  - [ ] On first open with no data, the home screen shows an empty, visually designed path — not a blank white screen, something that feels warm and inviting and suggests growth to come
  - [ ] As the user journals and sets goals, the path builds out with AI-suggested milestone nodes toward their goals
  - [ ] The visual style is colorful, clean, and optimistic — warm and high-spirited, not dark or clinical

- As a user, I want the home path to update as I make progress, so that the app reflects my actual journey rather than a static template.
  - [ ] The path updates after each completed journal entry as the AI refines milestone suggestions
  - [ ] If the user has no goals set, the path exists but has no milestone nodes — just the road itself
  - [ ] Milestone nodes appear as the AI generates them, connected to the user's short-term and long-term goals

---

### Epic: Daily Journaling Session

- As a user, I want the AI to open my journaling session with a warm first question, so that I never have to face a blank page and wonder what to write about.
  - [ ] When the user opens the Journal tab and has not yet journaled today, the AI sends the first message automatically (e.g., "How's your day going?")
  - [ ] The opening message is warm and conversational — not clinical, not generic
  - [ ] If the user has already journaled today, no new session starts (see re-read story below)

- As a user, I want to journal through a back-and-forth conversation with the AI, so that the experience feels like talking to a thoughtful coach rather than filling out a form.
  - [ ] The interface is a chat UI — AI messages on one side, user messages on the other
  - [ ] The AI follows up on what the user writes with relevant, adaptive questions
  - [ ] The AI asks a reasonable number of questions — enough to surface genuine reflection, not so many that the session feels like an interrogation
  - [ ] If the user has goals set, the AI's questions subtly orient toward those goals without being robotic about it
  - [ ] If the user has no goals set, the AI conducts standard reflective journaling without referencing goals

- As a user, I want to end the session when I feel done, so that journaling never feels like a forced obligation.
  - [ ] The user can signal they're done naturally (e.g., "that's all I have for now")
  - [ ] The AI acknowledges the signal and closes the session gracefully — no abrupt cut-off
  - [ ] No minimum number of exchanges required before ending

- As a user, I want to re-read today's journal conversation if I've already completed an entry, so that I can refer back to what I reflected on.
  - [ ] If the user opens the Journal tab after already completing an entry today, they see the previous conversation in read-only mode
  - [ ] There is no option to start a second entry on the same calendar day
  - [ ] It is visually clear that this is a completed session, not an active one

---

### Epic: Goal Setting

- As a user, I want to set short-term and long-term goals with minimal friction, so that goal-setting doesn't become a chore in itself.
  - [ ] The Goals tab has two clearly labeled sections: Short-Term Goals and Long-Term Goals
  - [ ] Creating a goal requires only a title — nothing else required
  - [ ] User can create multiple goals in each section
  - [ ] Goals can be edited (title changed) and deleted
  - [ ] All goals are visible at a glance in a list

- As a user, I want the AI to connect my journal entries to my goals when goals exist, so that my daily reflection has tangible direction rather than floating in a void.
  - [ ] If no goals are set in either section, the AI conducts standard journaling only — no goal-connection analysis in the debrief
  - [ ] If at least one goal exists, the AI incorporates goal-awareness into its questions and post-entry analysis
  - [ ] The goal-connection analysis appears in the post-entry debrief, not as interruptions during the journaling conversation

---

### Epic: Post-Entry Debrief

- As a user, I want to see a meaningful summary after I finish journaling, so that I leave each session feeling like something happened — not just that I typed into a box.
  - [ ] After the user signals the session is done, a post-entry debrief screen appears (separate from the chat view)
  - [ ] The screen shows a weekly streak bar (Monday through Sunday) with days journaled clearly marked
  - [ ] The screen shows the AI's written feedback: what the user is doing well, what to try doing differently, and (if goals are set) how today's entry connects to their goal progress
  - [ ] If no goals are set, the goal-connection section of the debrief is omitted — the screen still shows streak and AI reflection on the entry itself
  - [ ] The debrief is readable and digestible — not a wall of text

---

### Epic: Progress Dashboard

- As a user, I want to see my XP, streak, and character trait scores in one place, so that I can track how I'm growing over time.
  - [ ] The Progress tab displays current XP total
  - [ ] The Progress tab displays current streak count (consecutive days journaled)
  - [ ] The Progress tab displays all five character traits with their current scores:
    - Stoicism
    - Resilience
    - Patience
    - Action-Orientation
    - Critical Thinking
  - [ ] Trait scores update silently after each journal analysis — no pop-up or animation; the user discovers the updated values when they check the tab

- As a user, I want my streak to reset when I miss a day, so that the streak actually means something and staying consistent has real stakes.
  - [ ] If a user does not complete a journal entry on a calendar day, their streak resets to 0 the next time they open the app
  - [ ] The weekly bar on the post-entry debrief accurately reflects which days were completed in the current week

---

## What We're Building

Everything below must work at the end of 3–4 hours of building.

**1. Four-tab navigation: Home, Journal, Goals, Progress**
- [ ] A persistent tab bar with four tabs: Home, Journal, Goals, Progress
- [ ] Each tab navigates cleanly to its section
- [ ] Active tab is visually distinguished

**2. Home — Journey path visualization**
- [ ] A path/road visualization that starts empty (but visually designed) on first open
- [ ] Milestone nodes appear on the path as the AI generates them from journal + goal analysis
- [ ] Empty state is warm and inviting, not a blank screen
- [ ] Visual style: colorful, clean, optimistic — Duolingo-adjacent energy without copying Duolingo

**3. Journal — Chat-style AI journaling**
- [ ] Chat UI with AI's opening message sent automatically when the user opens the tab on a new day
- [ ] User can type and send messages in the chat
- [ ] AI responds adaptively to each user message
- [ ] Session closes when the user signals they're done
- [ ] One entry per calendar day enforced — previous entry shown as read-only if already completed
- [ ] Post-entry debrief screen appears after session closes

**4. Goals — Short-term and long-term goal setting**
- [ ] Two labeled sections: Short-Term Goals, Long-Term Goals
- [ ] "Add goal" action with a title-only input
- [ ] Goals displayed as a list in each section
- [ ] Edit and delete actions available per goal

**5. Post-entry debrief screen**
- [ ] Weekly streak bar (Mon–Sun) with completed days marked
- [ ] AI written feedback (strengths, what to do differently, goal connection if goals exist)
- [ ] Goal milestone progress if goals are set; omitted cleanly if not

**6. Progress dashboard**
- [ ] XP total
- [ ] Streak count
- [ ] Five character traits with current scores, updated silently after each entry analysis

**7. AI integration (Claude API)**
- [ ] AI opens each new journaling session with a warm, contextual first message
- [ ] AI asks adaptive follow-up questions based on user responses
- [ ] AI behavior branches: goal-aware if goals exist, standard journaling if none
- [ ] Post-session analysis: AI produces strengths, suggestions, and goal connections
- [ ] AI determines character trait deltas per entry and updates scores accordingly
- [ ] AI awards XP per completed entry
- [ ] AI refines home path milestone nodes after each goal-connected entry

---

## What We'd Add With More Time

- **Streak freeze / grace period:** A mechanic (like Duolingo's streak freeze) that lets the user miss one day without resetting. Good retention feature, but adds complexity to the streak logic.
- **XP leveling thresholds:** Define what it means to "level up" — XP thresholds, level names, visual celebration. Right now XP just accumulates as a number.
- **Trait history view:** A simple log or chart showing how each trait has shifted over time. Would require storing per-entry trait deltas, not just the running total.
- **Goal completion:** A way to mark a goal as achieved and archive it. Goals currently exist indefinitely with no resolution state.
- **Path node interactivity:** Tapping a milestone node on the home path opens a detail view explaining what the AI is suggesting and why.
- **AI journal tone modes:** Let the user choose their journaling mood before starting — reflective, energizing, or challenging — and the AI calibrates its questions accordingly.

---

## Non-Goals

- **Mobile app:** Web only. No iOS or Android build for this version.
- **Multi-user / authentication:** Single user (James), no login system, no accounts.
- **Notifications and reminders:** No push notifications, no email reminders, no scheduled prompts to journal.
- **Social features:** No sharing, no leaderboards, no comparisons with others.
- **Complex animations or RPG sequences:** No gear drops, elaborate level-up cinematics, or pixel art. Simple, clean visual updates only.
- **Hard goal deadlines:** Goals are directional north stars — no "complete by" dates, no overdue states.
- **Voice input:** Text only.

---

## Open Questions

- **XP per entry: flat or variable?** Is XP a flat amount per completed entry (e.g., 10 XP always), or does the AI decide based on entry depth or quality? Needs an answer before /spec — affects the AI prompt and data model.
- **Character trait score units:** What is the scale? An integer from 0–100? An unbounded accumulating integer? Needs an answer before /spec — affects both the AI output format and the Progress display.
- **How many path milestone nodes does the AI generate?** Is there a cap? Does it remove stale ones as goals progress? Needs an answer before /spec — affects how the home visualization is implemented.
- **What does the path look like with both short-term and long-term goals?** One unified path with different node styles? Separate branches? A design decision that can wait for /spec.
- **What fills the goal-connection section of the debrief when no goals are set?** If we show a section header and it's empty, that looks broken. Needs a defined empty state treatment before /spec.
