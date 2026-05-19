# workout-planner — v0.1

Phone-shaped prototype of a coaching-app workout planner. Modeled on an MSC-style
strength-training app: orange-themed mobile UI, day-cards listing exercises with
warmup + lettered exercises (A, B, C, D, E1/E2 supersets), tap-into-detail with
YouTube video tile, prescription text, results entry, and per-exercise history.

Plan + log + look back, in one surface.

## What's in it

- **Workouts list** — Upcoming / Past tabs. Each card: date header, workout name
  ("Strength W2"), warmup row + lettered exercise list, completion checkmark.
- **Workout detail** — orange header (date, name, exercise count), warmup card,
  exercise cards with YouTube tile (links to YouTube search for the exercise),
  prescription, "Add results" inline prompt, "Exercise History" pull-up.
- **Exercise history modal** — every past instance of the exercise across the
  schedule with prescription + logged results, and a "View Workout" deep-link.
- **Workout Comments modal** — empty state, then bubble chat with the coach (mocked
  as the user posting to themselves for now).
- **Habit Tracker** — date picker + 10 daily metrics (calories, protein, carbs,
  fat, weight, sleep, steps, energy, hunger, stress). Tap a row to enter a value;
  persists per date.
- **Account** — completion count, reset-data button.

## How "today" works

Seed data is anchored at **2026-05-19** (matches the source screenshots). The
schedule generator runs ±6 weeks around that anchor and labels weeks W1→W4 on a
rolling 4-week cycle. Tue + Thu workouts only.

If you ship this for real, the anchor would be `new Date()` and the schedule
would come from a backend program-design tool — but for a planner prototype, the
fixed anchor lets the "past sessions have realistic history" demo actually land.

## Improvements over the source

- **Compact exercise rows** on the list — name only, no per-set noise.
- **Results inline** under each exercise card on past sessions (the source
  hides them behind a separate screen).
- **Comment input always visible** on the comments modal, not just an empty state.
- **Reset button** on Account for clean demo runs.
- **Phone frame on desktop** so it doesn't sprawl when opened on a laptop.

## Decisions

- **No real YouTube embeds.** Each exercise tile links to a YouTube search for
  the exercise rather than embedding a specific (possibly broken) video ID.
  The visual matches the source's embed style; clicking opens results in a new
  tab. Cleaner than hallucinated IDs that 404.
- **localStorage for persistence.** Results, comments, and habit entries
  survive a refresh. Reset from Account if a clean demo run is needed.
- **Single-file HTML + data.js.** No build step. Tailwind via CDN.
- **`prompt()` for value entry.** Native prompt is fine for v0.1 — a custom
  sheet would be the next polish step.

## Known issues / parked

- No drag-to-reorder, no add-exercise, no add-workout from the UI — the schedule
  is seed-only. Editing happens by adding to `data.js`.
- Timer button is a stub (alert).
- Coach voice in Comments is single-user only; multi-party threads would need
  an `author` toggle in the data model.
- Habit-tracker visualisation (line charts over time) not built — the screenshots
  only showed the entry surface.

## Run

Open `index.html` directly, or `python3 -m http.server 8765` from `prototypes/`
and visit `/workout-planner/`.
