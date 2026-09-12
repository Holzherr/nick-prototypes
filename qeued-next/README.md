# Qeued (next)

Shared watchlist + recommendations: track titles as watched / watching / want to watch / dropped,
rate them, follow people, connect with a partner for joint picks, and let "Watch Tonight" choose
three from a mood. Built in Lovable (Mar–Apr 2026, exported to
[Holzherr/joint-watch-joy](https://github.com/Holzherr/joint-watch-joy)), moved into this
structure on 9 Sep 2026. Conventions mirror `../workout-hub-next` (and GitLaw's front-law repo).

- **Live:** https://qeued.com (built by the workflow in Holzherr/qeued from this folder)
- **Preview:** https://holzherr.github.io/nick-prototypes/qeued-next/
- **Storybook:** https://qeued.com/storybook/

## Stack

React 19 · TypeScript · Vite · Tailwind 4 (tokens in `src/styles/tailwind.css`, documented in
`DESIGN.md`) · Radix primitives via the shadcn wrappers we kept · react-router 6 · react-query ·
sonner · lucide · Storybook 10 (react-vite) · Vitest · oxlint · vite-plugin-pwa.

Backend: Supabase project `piwfcsvnxcmxmvfhgtbk` (eu-central-1). Schema in
`supabase/migrations/`, six Deno edge functions in `supabase/functions/` calling the Anthropic
API (Haiku 4.5 for search / enrich / popular, Sonnet 5 for recommendations and Watch Tonight)
through `_shared/claude.ts`. Results cache in `ai_cache`.

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

## The catalogue

Qeued holds its own records rather than licensing a feed, so the scripts in `tools/` are how
the catalogue gets built and kept honest. All of them need `SUPABASE_SERVICE_ROLE_KEY` in the
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

None of them need a service key. Each writes its statements to a file instead, and the
Supabase CLI applies them over the connection it already holds — which matters because both
repositories are public and the key should not sit on disk:

```
node tools/expand.mjs wave.json --gather gathered.json     # the slow half: reads pages only
node tools/expand.mjs --sql wave.sql --from gathered.json
node tools/availability.mjs --gather offers.json --only gathered.json
node tools/availability.mjs --sql offers.sql --from offers.json
node tools/enrich.mjs --sql enrich.sql
node tools/tidy.mjs --sql tidy.sql
npx supabase db query -f <file> --db-url "$QEUED_DB_URL"
```

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
