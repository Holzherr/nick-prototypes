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
