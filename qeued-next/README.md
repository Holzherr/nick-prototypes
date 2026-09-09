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

## Status

Ported 9 Sep 2026: every screen and flow from the Lovable build, same look. Data (115 titles,
193 actors, Nick's 29 entries, profile + avatar) copied over. Google sign-in dropped with the
Lovable OAuth wrapper; email + password remains.

Not yet: stories for the data-bound screens (Home, Profile, Search, Title), Google sign-in via
Supabase's native provider, dark mode (the Lovable tokens exist but nothing toggles them).
