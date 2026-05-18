# Home dashboard

Single-file web dashboard mirroring the Notion 🏡 Home content-ops view. Status only — actions live on `actions.html`.

## Files

- `index.html` — KPI strip + line-chart trends (templates, playbooks, committee, agent match rate).
- `actions.html` — this week's blockers + amber items, linked from the index via a thin CTA button.

## Data sources

- **Live** — agent match rate (LangSmith, weeks W13–W20), current snapshots for drafts-waiting, playbook usage, playbook jurisdiction mix, WG coverage.
- **Illustrative** — every other time-series. Weekly snapshot capture is tracked as CHB-017; charts back-fit a plausible trend through the W20 actual.

Refresh cadence target: weekly cron, Sunday night, once CHB-017 lands.

## Conventions

- Chart.js via CDN — no build step.
- Inline CSS / JS — keep it one file each.
- Bump `<title>` version when the layout shifts materially.
