# workout-planner — v0.2

Phone-shaped strength-planner prototype. Plan upcoming sessions with
suggestions derived from past performance + goals, log results inline,
and (optionally) sync everything to Supabase so it survives a browser
wipe and works across devices.

## What's in v0.2

### Inline results entry
- "Log results for A" opens a slide-up sheet, not a native prompt.
- One row per set, pre-filled with **suggested weight** (greyed placeholder),
  **target reps**, and **target RPE** parsed from the prescription.
- Editable: tweak any cell, add or remove sets, append free-text notes.
- Save commits to localStorage and (if enabled) syncs to Supabase in the
  background — no page reload.
- Same sheet for habit-tracker entries.

### Suggestions on upcoming workouts
- Each exercise card on a future-dated workout shows a "Suggested today"
  block: per-set weights × target reps, plus a "Last time" line for
  reference.
- Engine is RPE-aware:
  - Last set well under target RPE → full bump (+2.5 kg compound, +5 kg deadlift).
  - Last set near target RPE → ¾ bump.
  - Last set at target RPE → ½ bump (the "small iteration" floor).
  - Last set over target → hold.
- The list-view exercise rows also surface a one-line top-set suggestion
  (`→ 50kg`) so you can scan the week ahead.

### Goals
- Account → Goals lists every exercise in the program.
- Tap any lift to set a target weight × reps + deadline + note.
- Goals show on the exercise card in detail view: target, current best,
  progress bar.
- Goals climb in the data layer alongside results — they sync to Supabase
  with everything else.

### Cloud sync (Supabase)
- Account → Cloud sync. Paste your Supabase project URL, anon key, and
  email. Tick Enable, hit Save.
- Saves all logged results, comments, goals, and habit entries into a
  single `workout_data` row keyed by email.
- Auto-push: debounced 800 ms after every write.
- Auto-pull: on app boot, if configured.
- Manual Push/Pull buttons + Test connection.
- DDL snippet rendered in the page — paste into Supabase's SQL editor.
- localStorage is always the first write target, so the app works fully
  offline. Cloud is purely a sync layer.

## Past results, refreshed

Seed data now reads as a coherent training story across the eight past
sessions: W3 base → W4 peak → W1 deload → today (W2). Each lift's numbers
climb consistently week-over-week, with realistic per-set weight, reps,
and RPE so the history modal and suggestion engine look right out of the
box.

## Decisions

- **Suggestions always nudge up at the same RPE.** Even on a deload→working
  jump, the engine adds half a bump rather than holding the line. That's
  the explicit ask: small iterations to improve.
- **Single Supabase row, JSON payload.** No per-workout rows, no joins.
  Simplest possible schema for a personal-use prototype. Swap to a
  relational shape when this graduates from prototype.
- **Anon key in the client is OK.** Supabase anon keys are designed for
  client-side use; tighten with RLS + auth before sharing.
- **YouTube tile still links to search.** Same call as v0.1 — no hallucinated
  video IDs. Swap for real `youtube.com/embed/<id>` when a curated video
  list exists.
- **Comments are mock-only.** No coach side; bubbles persist locally + to
  cloud but author is always "Nick".

## Known issues / parked

- Timer button is still a stub.
- No editing the program itself from the UI — exercises and prescriptions
  come from `data.js`.
- No habit charts.
- Cloud sync conflict resolution is "last write wins" — fine for a single
  user across devices, not for shared accounts.
- The inline results sheet doesn't validate (you can save `weight=banana`).

## Run

Open `index.html` directly, or serve from `prototypes/` and visit
`/workout-planner/`. localStorage persists between reloads; flip on cloud
sync to keep the data across devices.
