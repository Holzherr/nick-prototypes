# Files index prototype

A UX exploration of GitLaw's files-index feature, rendered against a corpus of 23 sample contracts pulled from the `memory-tests` repo (originals at `~/Documents/GitHub/memory-tests/testdata/`).

The contracts mostly come from Whisk / Foodient / Reciply paperwork (NDAs, employment contracts, option agreements, articles, TM filings) plus a few sample templates. They're real-format documents but the parties are personal/historical, not live client work.

## What's in here

- **`overview.html`** — entry point. Tabs: All files · Categories · Knowledge · Parties · Contacts · Status.
- **`sources.html`** — source-document browser. Renders the 23 underlying `.md` files with `marked.js` so you can read the originals the index is built over.
- **`sources/`** — the 23 markdown files themselves.
- **`data.js`** — extracted structured data (party names, dates, categories, etc.) per document.
- **`pages.js`, `overview.js`** — the prototype's tab logic.
- **`overview.css`** — styling.

## Snapshot origin

Captured from `memory-tests/generated/memory-runs/20260508-131401/overview-html/` (the May 8 run). If a newer run produces a meaningfully different layout, re-snapshot by copying the `overview-html/` from a later run.

## Notes

- The prototype is fully static — no fetches except for the markdown source viewer (which loads `sources/<filename>.md` on click).
- Links to sources from the index pages aren't wired up yet; the `sources.html` browser is standalone for now.
