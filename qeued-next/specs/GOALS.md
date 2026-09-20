# Goals

Only Nick edits this file. Header format is fixed: `## G-NN · <app slug> · active|paused|done`. Every goal needs a metric the
Analyst can read. Items that serve no active goal are parked by the gate. The agent team reads this file from the clone each night.

## G-09 · qeued · active
Goal: everything scraped is published — no title sits unresolved or hidden.
Metric: published_share — titles live on qeued.com ÷ titles scraped (candidates + catalogue), from the catalogue tables
Now: unknown; 723 candidates never resolved as of PR #97 · Target: 100% of resolvable candidates published, the rest retired with a reason · By: 2026-10-31
Weight: high
Constraints: own catalogue only, no licensed data; invented titles are retired, not published; corrections through tidy.mjs with a reason.
Not now: new scrape sources.

## G-10 · qeued · active
Goal: useful as a recommendation service to Nick — it is not yet.
Metric: nick_recs_taken — recommendations Nick adds to his watchlist or marks watched, per week, from his household's watch_entries
Now: ~0 · Target: ≥ 2 a week for 4 consecutive weeks · By: 2026-11-30
Weight: high
Constraints: nothing waits on a model; no model spend on profiles nobody opens; recommendations explain why in one line.
Not now: other households' growth until Nick finds it useful himself.
