# Maths Garden

Early-maths games for four-year-olds, plus free printables that feed them. Paper cards teach a stage at
home; the games on an iPad or phone check it, score every round and move the child up a level, which
unlocks the next stage's printables. Built for Tara (4). Started as a single HTML file from a claude.ai
chat on 11 Sep 2026 and moved into this structure the same day. Conventions mirror `../qeued-next` and
`../workout-hub-next` (and GitLaw's front-law repo).

- **App:** https://holzherr.github.io/nick-prototypes/maths-garden/
- **Free printables (no sign-in):** https://holzherr.github.io/nick-prototypes/maths-garden/#/resources
- **Storybook:** https://holzherr.github.io/nick-prototypes/maths-garden/storybook/

## What it does

- **Parent account** (Supabase email + password) with **child profiles**. The device remembers the child
  and opens straight into their garden; the parent stays signed in.
- **Five games**, five questions a round, three levels each: Quick Peek (subitising), Count With Me, Find
  the Number, Which Has More?, One More Unicorn. Spoken prompts in a British voice, stars, praise by name.
- **Levelling:** two rounds in a row at 80%+ moves a game up; two under 50% drops it back
  (`features/games/engine.ts`). Game level n = printable stage n (`features/curriculum/skills.ts`).
- **Stickers:** after every finished round the child picks a pack (Unicorns, K-pop Hunters, Ice Queen) and
  gets a sticker for their sticker book; perfect rounds give sparkly ones. Emoji art only, no film characters.
- **Grown-ups screen** (behind a sum): accuracy per skill, often-missed numbers, level overrides, a weekly
  check-in with six parent-scored probes, and a print link for the current stage.
- **Offline-first:** every write lands in local storage first and uploads when there is signal
  (`features/progress/repo.ts`).
- **Printables** (`#/resources`, public): the Quick Peek dot card maker — name, picture, stage, five
  patterns, answers on the back (mirrored for double-sided printing), numeral cards, a how-to page, 8 or 2
  cards per A4 page. The Quick Peek game draws the same patterns.

## Layout

```
src/
  app/                    App.tsx (hash routes; auth → profiles → garden), config.ts (Supabase URL + anon key), update-prompt, use-hash-route
  shared/brand/           UnicornMark, AppIcon, Logo
  shared/components/ui/   Button (candy variants), Card, Input
  shared/layout/          FloatingHearts, Splash
  shared/supabase/        client.ts, types.ts
  shared/utils/           cn, storage (never-throwing localStorage, MemoryStorage), random (mulberry32)
  features/auth/          AuthContext, AuthForm (brick), AuthScreen
  features/children/      model (age), api, use-children (cached), ChildForm, ProfilesScreen
  features/games/         catalog, questions (tested), engine (levels, stats; tested), sound, components/
  features/stickers/      catalog (packs, draw; tested), StickerBadge, PackChooser, StickerReveal, StickerBookScreen
  features/progress/      model, repo (outbox; tested), supabase-remote, memory-remote, probes, fixtures, SkillRow, CheckInPanel, DashboardScreen
  features/garden/        GardenApp: one child's app (home, game, end + sticker, sticker book, gate, grown-ups)
  features/curriculum/    skills.ts: six skills × three stages, linked to games and probes
  features/resources/     catalog (printables, ready/planned), ResourcesScreen, subitising/ (patterns, cards, card maker)
supabase/                 config.toml, migrations/0001_init.sql
tools/                    icon-square.svg + render-icons.sh (PNG icons via headless Chrome)
```

## Working on it

```
npm run storybook        # component workbench on :6008
npm run dev              # the app on :5173/nick-prototypes/maths-garden/
npm test
npm run check-types && npm run lint
npm run build && npm run build-storybook   # what CI does; output in dist/
```

Story conventions: CSF3, `satisfies Meta<typeof X>`, and a `parameters.docs.description.component` that
describes the visual layout. `Screens/Garden (playable)` runs the whole child app against an in-memory server.

## Backend

Supabase project `maths-garden` (org "Holzherr Apps", London). Tables: `children`, `maths_rounds`,
`maths_levels`, `maths_checkins`, `maths_stickers`; RLS gives a parent their own children and those
children's rows only. Schema changes: add a migration, apply it, update `src/shared/supabase/types.ts`.
Auth settings live in `supabase/config.toml` (`npx supabase config push`).

## Next

- More printables for every skill and stage: provider research and work plan in the assistant repo,
  `me/projects/maths-garden/`.
- A custom domain and deploy repo (the Qeued/TigerWorkouts pattern) if it goes beyond family use.
