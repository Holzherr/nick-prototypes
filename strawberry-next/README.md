# Strawberry (next)

Recipe app: save, cook, share. React rebuild of the Lovable export
(`Holzherr/strawberry-recipe-box`, frozen) as a component library first, app second — every visual
piece is a Storybook "brick" (props in, callbacks out, no data fetching) so it can be reviewed in
isolation before it touches real data. Conventions mirror `../workout-hub-next`.

- **Preview:** https://holzherr.github.io/nick-prototypes/strawberry-next/
- **Storybook:** https://holzherr.github.io/nick-prototypes/strawberry-next/storybook/
- **Live:** none — no domain yet. `VITE_BASE` is wired so pointing one at it is a config change.

Publish a recipe with an ingredient and step builder, browse the public feed, save into a recipe
box with collections, build a shopping list that categorises itself, plan meals with macro totals,
and share all of it inside a household. An AI drawer does the same by prompt; an MCP edge function
exposes the same tools to agents.

## Stack

React 19 · TypeScript · Vite 8 · Tailwind 4 (tokens in `src/styles/tailwind.css`, documented in
`DESIGN.md`) · Radix primitives · lucide icons · react-router 6 · react-query · sonner ·
Storybook 10 (react-vite) · Vitest · Supabase (own project, Deno edge functions on the Anthropic API).

## Layout

```
src/
  app/                    App.tsx (providers + routes), AppContext, ProtectedRoute, update-prompt
  shared/brand/           Logo, AppIcon — the strawberry mark, the only colour in the app
  shared/components/ui/   the 14 primitives kept from shadcn
  shared/layout/          Layout, NavLink (bottom bar on mobile, top nav on desktop)
  shared/supabase/        client, generated types
  shared/utils/           cn()
  features/auth/          AuthContext, Login, Signup
  features/discover/      Home feed, Browse (search + filter chips)
  features/recipe/        RecipeDetail, RecipeCard, Publish, ImportRecipeDialog
  features/box/           recipe box and collections
  features/shopping/      shopping list + category detection (tested)
  features/plan/          meal plan
  features/household/     household setup and join
  features/profile/       profile, unit preference
  features/assistant/     AI chat drawer
supabase/                 migrations, edge functions
```

## Working on it

```
npm run storybook      # component workbench on :6007
npm run dev            # the app on :5173
npm test               # model tests
npm run check-types
npm run build && npm run build-storybook   # what CI does; output in dist/
```

Story conventions (from front-law): CSF3, `satisfies Meta<typeof X>`, `title: 'Shared/UI/X'` or
`'Recipe/X'`, `'Shopping/X'`…, and a `parameters.docs.description.component` that describes the
**visual layout** so the next person (or agent) can find the component instead of rebuilding it.

## Status

Front end ported and covered; the backend half is next. Tasks run against
`assistant-nick:me/projects/strawberry/2026-09-09-strawberry-migration-plan.md`.

- [x] Task 1 — scaffold on tiger's configs
- [x] Task 2 — shared UI primitives + stories
- [x] Task 3 — layout, brand, Supabase client
- [x] Task 4 — screens and routes
- [x] Task 5 — tested helpers
- [x] Task 6 — brick stories
- [ ] Task 7 — own Supabase project, household-scoped RLS
- [ ] Task 8 — edge functions on the Anthropic API, JWT-scoped MCP
- [ ] Task 9 — data migration, photo storage
- [ ] Task 10 — PWA assets, preview deploy

Stories cover the primitives, the brand, the app shell, RecipeCard, the meal-plan bricks, the auth
screens and NotFound. Still to get one: the discover, box, shopping, household and profile screens,
which fetch on mount and need their data lifted to a props boundary first.

### Known defects carried over from the Lovable app

- `detectCategory` matches keywords as bare substrings and takes the first category that hits, so
  "tahini" files under Seafood and "frozen peas" under Produce. Pinned in
  `features/shopping/model.test.ts`; fix by matching on word boundaries and preferring the longest
  keyword.
- Every user-owned table is keyed by a free-text `session_id` with `USING (true)` RLS. Task 7
  replaces it with `household_id` and membership policies; until then the app still points at
  Lovable's project and its data is world-readable.
- The `mcp` edge function runs on the service-role key and takes the identity as a tool argument.
  Task 8 makes it read the caller from the JWT.
