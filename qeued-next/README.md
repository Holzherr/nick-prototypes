# qeued (next)

Shared watchlist + recommendations: track titles as watched / watching / want to watch / dropped,
rate them, follow people, connect with a partner for joint picks, and let "Watch Tonight" choose
three from a mood. Built in Lovable (Mar–Apr 2026, exported to
[Holzherr/joint-watch-joy](https://github.com/Holzherr/joint-watch-joy)), moved into this
structure on 9 Sep 2026. Conventions mirror [TigerWorkouts](https://github.com/Holzherr/tigerworkouts) (and GitLaw's front-law repo).

- **Live:** https://qeued.com (built by the workflow in Holzherr/qeued from this folder)
- **Preview:** https://holzherr.github.io/nick-prototypes/qeued-next/
- **Storybook:** https://qeued.com/storybook/

## Stack

React 19 · TypeScript · Vite · Tailwind 4 (tokens in `src/styles/tailwind.css`, documented in
`DESIGN.md`) · Radix primitives via the shadcn wrappers we kept · react-router 6 · react-query ·
sonner · lucide · Storybook 10 (react-vite) · Vitest · oxlint · vite-plugin-pwa.

Backend: Supabase, see [Backend](#backend) below.

## Layout

```
src/
  app/                    App.tsx (providers + routes + guards), config.ts (Supabase URL + anon key), update-prompt
  shared/brand/           Logo, AppIcon (the gradient Q tile)
  shared/components/ui/   the 14 shadcn primitives the app uses: button, card, badge, input, select, tabs,
                          dialog, avatar, tooltip, textarea, switch, popover, toast(+toaster/use-toast), sonner
  shared/layout/          Layout (signed-in frame + mobile tab bar), PublicHeader, NavLink
  shared/supabase/        client.ts, types.ts (generated: npx supabase gen types typescript --linked)
  shared/utils/cn.ts
  features/auth/          AuthContext, AuthScreen (email + password)
  features/library/       HomeScreen, AddToWatchlistSelect, model.ts (status labels, sort — tested), fixtures
  features/discover/      Explore, Search, Genre, Actor screens
  features/title/         TitleDetailScreen (calls enrich-title)
  features/recommend/     RecommendationCard
  features/social/        Profile, PublicProfile, Invite, FollowListDialog
  features/landing/       LandingScreen, NotFound
supabase/                 config.toml, migrations/, functions/
tools/migrate-data.mjs    one-off copy from the Lovable project (already run)
```

## Working on it

```
npm run storybook      # component workbench on :6007
npm run dev            # the app on :5173 (against the live Supabase project)
npm test               # model tests
npm run check-types && npm run lint
npm run build && npm run build-storybook   # what CI does; output in dist/
```

Edge functions: edit under `supabase/functions/`, then
`npx supabase functions deploy --project-ref piwfcsvnxcmxmvfhgtbk`. Secrets:
`npx supabase secrets set ANTHROPIC_API_KEY=… --project-ref piwfcsvnxcmxmvfhgtbk`.
Schema changes: add a migration, `npx supabase db push`, regenerate `types.ts`.

Story conventions (from front-law): CSF3, `satisfies Meta<typeof X>`, `title: 'Shared/UI/X'`,
`'Library/X'`, `'Recommend/X'`, `'Social/X'`, `'Screens/X'`, and a
`parameters.docs.description.component` that describes the **visual layout** so the next person
(or agent) can find the component instead of rebuilding it. Screens that fetch on mount get a
story only for their first frame.

## Backend

Supabase project `piwfcsvnxcmxmvfhgtbk` (eu-central-1). Schema in `supabase/migrations/`, six
Deno edge functions in `supabase/functions/` calling the Anthropic API (Haiku 4.5 for search /
enrich / popular, Sonnet 5 for recommendations and Watch Tonight) through `_shared/claude.ts`.
Results cache in `ai_cache`.

**Tonight** never waits on the model: `features/tonight/fastTonight.ts` ranks the profile's list on the device with `_shared/ranking.ts` (one line of data per pick), "Sharpen these" calls `watch-tonight` and the scored slate waits behind a "Sharper picks ready" button; `slateCache.ts` keeps scored slates in localStorage for 24h per profile, mood and length.

**Agent snapshot** (migration 0025, written, **not applied**). `agent_snapshot(days int) returns jsonb`
is the only way the team's Analyst reads this database: one `security definer` function, and one
login role `agent_reader` holding EXECUTE on that function and no grant on any table, so widening
what it sees takes a migration rather than a grant. Profiles come back as `md5(profile_id::text)`
and no column of `profiles` is read, so the output is safe to paste into a report. To turn it on:
apply the migration, set the role's password by hand (it is deliberately not in the file, which is
public), then store the connection string in the keychain under `agent-team-qeued-db`; the shape is
in the migration's header comment. Nothing in `src/` calls it and the app does not change when it
is applied. Three sections:

```json
{
  "generated_at": "2026-09-20T21:00:00+00:00",
  "days": 7,
  "catalogue": { "held": 2140, "titles": 2255, "candidates_not_held": 610, "published_share": 0.778 },
  "candidates": {
    "by_status": { "pending": 420, "held": 2140, "failed": 175, "skipped": 15 },
    "top_errors": [{ "last_error": "no UK page", "candidates": 96 }]
  },
  "household_activity": {
    "measures": "household activity, not recommendations taken",
    "weeks": [{ "week": "2026-W38", "profile": "9f86d081884c…", "status": "watched",
                "created": 3, "updated": 1, "rated": 2 }]
  }
}
```

`catalogue.held` is titles with `catalogue_version > 0`, `candidates_not_held` is every
`catalogue_candidates` row whose status is not `held` (skipped included), and `published_share`
is `held ÷ (held + candidates_not_held)`, the G-09 number. `candidates.top_errors` is the ten most
common `last_error` values. `household_activity.weeks` is per ISO week × hashed profile × current
status: rows created, rows changed after creation (`updated_at > created_at`), and rows carrying a
`watched_rating`. It measures household activity only: no column says a `watch_entries` row came
from a recommendation, so recommendations taken (G-10) is not readable until QD-004 adds one, and
the fixed `measures` key is there so the report never presents this section as that metric.
`days` is clamped to 1–400 and defaults to 7.

## The catalogue

qeued holds its own records rather than licensing a feed, so the scripts in `tools/` are how
the catalogue gets built and kept honest.

### Growing it

What the catalogue should hold but does not yet is a table, not a file:
`catalogue_candidates`, one row per wanted title, carrying how badly it is wanted and whether
it has been fetched. That is what makes the expansion resumable — interrupt it anywhere and
the next run picks up what is still pending, having skipped what already landed.

```
node tools/candidates.mjs import proposals-*.json   # queue them, skipping what is held
node tools/wave.mjs --size 150                      # fetch the 150 most-wanted, end to end
node tools/candidates.mjs stats                     # what is left, by priority
```

`wave.mjs` is the whole loop: take the most-wanted pending titles, read each page, write the
facts and the UK offers, then reconcile — what landed becomes `held`, what could not be
resolved gets an attempt recorded and is retired on the second failure, so the next list of
proposals does not keep re-suggesting a title that has no UK page.

Proposals come from `tools/data/candidates-*.json`, written by research rather than by hand.
They overlap heavily, which is fine: import is an upsert on name, year and type, and the
second proposal of the same title raises its priority rather than adding a row.

A candidate that fails twice is retired, and the resolver only ever tried the name the
proposal used. A real film proposed as "Hotaru no haka" is retired because the search's
leading result is the 2005 remake and the year rule rightly refuses it, while the 1988 page
sits one name away as Grave of the Fireflies. `tools/data/aliases.json` is where that second
name is written down, one record per candidate with the reason it exists, the same convention
as the corrections files. `expand.mjs` reads it itself: a candidate whose own name finds no
page is tried under each alias in turn, and what comes back is filed under the candidate's
own name and year, because that is its identity. A candidate with no alias costs exactly
what it did before. Giving retired candidates a second name goes in this order:

```
node tools/candidates.mjs failed failed.json    # every retired row, with its last error
# write aliases for the real titles in that list into tools/data/aliases.json
node tools/aliases.mjs check                    # shape, no duplicate name+year+type, a why on each
node tools/candidates.mjs retry --aliased       # requeue only the rows that now have an alias
node tools/wave.mjs --size 150                  # the wave picks the aliases up by itself
```

`retry --aliased` prints how many it requeued and how many it left alone. Bare `retry` only
says how many rows a full requeue would put back and exits without writing; `retry --all`
is for a change to the resolver itself, and it is the whole retired list, invented titles
included. `node tools/aliases.mjs apply batch.json` adds an `aliases` array to each record
of a `candidates.mjs next` batch, for a batch someone wants to read before it runs.

All of the scripts below need `SUPABASE_SERVICE_ROLE_KEY` in the
environment and all of them take `--dry-run`. Run them in this order for a new wave:

```
node tools/expand.mjs        # resolve candidate titles to JustWatch pages and write the facts
node tools/posters.mjs       # poster art, taken from the page already cited for the title
node tools/availability.mjs  # UK offers; --stale revisits only what has passed its 30-day expiry
node tools/enrich.mjs        # apply the written entries in tools/data/{synopses,tags}-*.json
node tools/tidy.mjs          # deduplicate scraped fields and apply tools/data/corrections-*.json
node tools/prerender-catalogue.mjs   # per-title HTML, sitemap, robots.txt, llms.txt (CI runs this)
```

The split matters: `expand`, `posters` and `availability` read pages and write what they find.
`enrich` writes what was researched and composed here — synopses, tone and theme tags, episode
counts — and it only ever fills a field that is empty, so a hand-edit always survives a re-run.
`tidy` is the only script that overwrites, which is why every overwrite is listed by hand in a
corrections file with the reason it is wrong.

### The steps, and why they are separate

None of them need a service key. `tools/db.mjs` runs SQL over the connection the Supabase CLI
already holds, which matters because both repositories are public and the key should not sit
on disk. Set it once:

```
export QEUED_DB_URL="postgresql://postgres.<ref>:<password>@<region>.pooler.supabase.com:5432/postgres"
```

The CLI sends a file as a SINGLE prepared statement, so anything needing more than one
statement goes inside a `do $$ … $$` block — which has the useful side effect of making a
batch land whole or not at all. The tools can also emit their SQL to a file for review:

```
node tools/expand.mjs wave.json --gather gathered.json     # the slow half: reads pages only
node tools/expand.mjs --sql wave.sql --from gathered.json
node tools/availability.mjs --gather offers.json --only gathered.json
node tools/availability.mjs --sql offers.sql --from offers.json
node tools/enrich.mjs --sql enrich.sql
node tools/tidy.mjs --sql tidy.sql
npx supabase db query -f <file> --db-url "$QEUED_DB_URL"
```

Writing what a page cannot supply — the synopsis, because qeued's are written for qeued, and
the tone and theme tags, because no page carries them — is a research pass rather than a
scrape:

```
node tools/todo.mjs synopsis --out work/ --chunk 60   # cut the outstanding work into chunks
# researchers write one out-NN.json per chunk, following tools/data/*-BRIEF.md
node tools/normalise-tags.mjs work/                   # tags only: fold near-misses, drop the rest
node tools/enrich.mjs --dir work/ --apply
```

Two more for the damage that only shows up at scale. `dedupe.mjs` finds the same work
catalogued under two years and keeps the fuller copy, unless someone has it on a list.
`fix-slugs.mjs` repairs addresses that lost their accented letters.

Separating the gather from the write is not only about credentials: a failed write then costs
no re-scraping, and the gathered file is reviewable before anything lands. The query channel
sends a file as one statement, so each tool emits a single one — an `UPDATE … FROM (VALUES …)`,
a CTE, or a `DO` block — and a wave lands whole or not at all.

A title's identity is its name and year, not its slug: an early collision left one row as
`winter-s-bone-2010-2`, and matching on slug alone would have filed a second copy.

Tone and theme use closed vocabularies, listed in migration `0018` and enforced by `enrich.mjs`
before anything is written. They exist because genre cannot separate a bleak procedural from a
warm family comedy once both are filed under Drama, and the ranker needs that distinction.

## Status

Ported 9 Sep 2026: every screen and flow from the Lovable build, same look. Data (115 titles,
193 actors, Nick's 29 entries, profile + avatar) copied over. Google sign-in dropped with the
Lovable OAuth wrapper; email + password remains.

Not yet: stories for the data-bound screens (Home, Profile, Search, Title), Google sign-in via
Supabase's native provider, dark mode (the Lovable tokens exist but nothing toggles them).
