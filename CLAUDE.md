# Prototypes — public, deployed to GitHub Pages

This folder holds **public-facing prototypes**. Anything in here is uploaded to GitHub Pages by `.github/workflows/pages.yml` on every push to `main` that touches `prototypes/**`. **Don't put anything sensitive here.**

Live: `https://<owner>.github.io/<repo>/` (the exact URL appears in the workflow run output after the first deploy).

## What is and isn't here

In this folder (public):
- `lawyer-loop-in-lite/` — concierge handoff (A) + bring-your-own-lawyer (B) flow prototypes
- `legal-advice-agent/` — agentic legal-advice UX prototype
- `files-index/` — files-index UX rendered against a corpus of 23 sample contracts (from the memory-tests project), with a `sources/` viewer to read the original markdown
- `index.html` — landing page that catalogues the prototypes above

Elsewhere in the repo (NOT deployed):
- `gl/prototypes/team-board/` — Nick's personal team dashboard, reads private data from `gl/team/`, `personal/contacts/`, `personal/health/`. Local-only.
- `gl/team/`, `personal/contacts/`, `personal/health/`, `gl/my-tasks.json` — all private; gitignored or kept off Pages.

The Pages workflow uploads only this `prototypes/` folder (`upload-pages-artifact` with `path: 'prototypes'`), so even if private files exist elsewhere in the repo they don't leak.

## How to work in here

Type **`/work-prototype <slug>`** to start a session — that command walks the same loop the `gitlaw-redline-nick` repo uses:

1. **Orient** — read the prototype's `README.md` to see current state, version, what's in flight.
2. **Propose, briefly** — summarise back to Nick in 2-3 sentences. List open / parked items. Ask which to tackle.
3. **Talk before code** for non-trivial changes — surface 2-3 mutually-exclusive options with the real tradeoff each carries. Don't pick silently. Trivial tweaks (typos, copy, single-line CSS) can skip this.
4. **Branch + build** — cut `feature/<slug>`, `fix/<slug>`, or `chore/<slug>`. Make the edit. Verify in browser before claiming done.
5. **Ship** — PR + self-merge with `gh pr merge <n> --squash --delete-branch`, then `git pull`. Pages redeploys in ~30-60s.
6. **Update the prototype's `README.md`** to reflect the new current state.

## Conventions

- **Single-file HTML where possible.** No build step. No framework. Tailwind via CDN is fine; small `data.js` companion files are fine. If a prototype outgrows this and needs a build, lift it into its own repo.
- **Version in `<title>`.** Bump when the change feels like a real new version (flow shift, structural redesign). Tiny tweaks don't need a bump.
- **`README.md` is the only doc per prototype.** If a prototype is small, the README can be terse. If it grows enough that a session-start orient takes longer than a couple of minutes, split it into a deeper context file alongside.
- **No PII or client data.** This folder is public via Pages even though the repo may be private.
- **Don't `cd` into `gl/` or `personal/`** from inside a prototype build. The prototypes are standalone — they should not import private workspace state.

## Adding a new prototype

1. Create `prototypes/<slug>/` with at least `index.html` and `README.md`.
2. Add a card for it to `prototypes/index.html` (the landing page).
3. Push to `main`. Pages auto-deploys.

The landing page lives at `prototypes/index.html` — the GitHub Pages site root.
