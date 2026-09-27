# Goals

Only Nick edits this file. Header format is fixed: `## G-NN · <app slug> · active|paused|done`. Every goal needs a metric the
Analyst can read. Items that serve no active goal are parked by the gate. The agent team reads this file from the clone each night.

## G-01 · maths-garden · active
Goal: Tara keeps playing and levelling up.
Metric: rounds_7d — completed rounds in the last 7 days, from agent_snapshot
Now: unknown (no snapshot yet) · Target: not lower than the week before the pilot · By: 2026-09-29
Weight: high
Constraints: no child data outside the app's own database; no paid APIs; nothing a four-year-old has to read; no film or brand characters.
Not now: new games unless Nick asks; social features; anything aimed at other parents.

## G-02 · maths-garden · active
Goal: the app measures itself, so the team can see what Tara does.
Metric: report_sections_with_data — Analyst report sections with real numbers, 0–5
Now: 0 · Target: 5 · By: 2026-09-26
Weight: high
Constraints: read-only aggregates through agent_snapshot; child ids hashed; Nick applies migrations.
Not now: analytics dashboards; anything beyond what the Analyst needs.

## G-14 · maths-garden · active
Goal: character building and more difficulty and variety. An original character grows as Tara plays, and the maths keeps stretching her with new kinds of rounds (Nick, 26 Sep 2026).
Metric: variety_7d — distinct game types played and highest level reached in the last 7 days, from agent_snapshot
Now: unknown · Target: a character that visibly grows with her progress; at least 2 new round types; her highest level rising week on week · By: 2026-11-15
Weight: high
Constraints: an original character (no film or brand characters); nothing a four-year-old has to read; no paid APIs or paid image generation without Nick's OK.
Not now: social features; anything aimed at other parents.
