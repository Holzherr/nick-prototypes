# Goals

Only Nick edits this file. Header format is fixed: `## G-NN · <app slug> · active|paused|done`. Every goal needs a metric the
Analyst can read. Items that serve no active goal are parked by the gate. The agent team reads this file from the clone each night.

## G-11 · piano · active
Goal: Tara practises the piece Louise set this week, at home, between lessons.
Metric: sessions_7d — practice sessions in the last 7 days where she reached the last note of the current piece (needs instrumentation: none exists today; cheapest is a localStorage log read by a snapshot endpoint or a parent-tap "we practised" button)
Now: unknown (no instrumentation) · Target: 2/week, matching the Wed + Sat slots · By: 2026-10-17
Weight: high
Constraints: no child data outside the app; nothing a four-year-old must read unaided (letter names and lyrics are cues, not instructions); no fail state, no rhythm scoring, no guilt loop (design doc §4); right hand orange / left hand green only, never reused (DESIGN.md:32-38); no mic or paid API work until Nick decides the reward trigger; every new score `verified: true` only after Nick checks it against the book.
Not now: native iOS port; mic pitch detection; LLM coach; teacher-facing anything; other families.

## G-12 · piano · active
Goal: the current piece in the app is always the one Louise set most recently.
Metric: piece_lag_days — days between Louise's lesson email setting a piece and that piece being playable and verified in the app (from piano-log.md dates vs commit dates; today: This Old Man set 10 Sep, in app unverified 13 Sep)
Now: 3 days, unverified · Target: ≤ 3 days, verified · By: 2026-10-17
Weight: medium
Constraints: transcription reviewed by a human before it reaches Tara (design doc §5.2); scores stay in beats, not seconds; keep prior pieces playable so "replay earlier tunes" is possible.
Not now: in-app camera ingestion; automated OMR without review.
