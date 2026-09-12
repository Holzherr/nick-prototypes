# Maths Garden

Early-maths games for four-year-olds, plus free printables that feed them. Paper cards teach a stage at
home; the games on an iPad or phone check it, score every round and move the child up a level, which
unlocks the next stage's printables. Built for Tara (4). Started as a single HTML file from a claude.ai
chat on 11 Sep 2026 and moved into this structure the same day. Conventions mirror `../qeued-next` and
`../workout-hub-next` (and GitLaw's front-law repo).

- **Live:** https://nickholzherr.com/maths/ (published by `.github/workflows/maths.yml` in Holzherr/nickholzherr.com;
  run `gh workflow run maths.yml -R Holzherr/nickholzherr.com` after merging here)
- **Homepage (signed out):** https://nickholzherr.com/maths/#/home · **sign in:** `#/login` · **the app:** `#/app`
- **Free printables (no sign-in):** https://nickholzherr.com/maths/#/resources
- **Guides:** `#/guides/stages`, `#/guides/gamified-learning` and `#/guides/how-it-scores`
- **Preview of every merge:** https://holzherr.github.io/nick-prototypes/maths-garden/
- **Storybook:** https://holzherr.github.io/nick-prototypes/maths-garden/storybook/

## What it does

- **Public homepage** (`features/marketing/`): a signed-out visitor at `#/` gets the value proposition, the
  print → check → move up → print next loop, every printable grouped by skill, the games, an FAQ and three
  research-backed guides (the stages of early maths and reading; whether gamified learning works, including
  the evidence against it; and how this app scores a child and decides when to move up). Claims and sources
  live in `articles.ts` and `faq.ts`, not in components.
  Signing in moved to `#/login`; `#/app` forces the app and is the PWA `start_url`, so the iPad icon still
  opens straight into the games. Signed-in and guest sessions skip the homepage entirely.
- **Parent account** (Supabase email + password) with **child profiles**. The device remembers the child
  and opens straight into their garden; the parent stays signed in.
- **Eight games**, five questions a round, five levels each: Quick Peek (subitising), Count With Me, Find
  the Number, Which Has More?, One More Unicorn, **Make Ten** (number bonds, on a five/ten frame and then
  without one), **One Fewer** (taking away, watching balloons go) and **Ten and Some More** (the teens as
  ten-and-something). Spoken prompts in a British voice, stars, praise by name.
- **Home leads with one suggested game** (`features/games/recommend.ts`) and its reason, with the rest
  behind "Or pick another game": never played wins outright, then not played today, weak accuracy,
  staleness, and a boost when one good round would level it up — minus whatever was just played, so the
  suggestion moves on by itself.
- **Levelling:** two rounds in a row at 80%+ moves a game up; two under 50% drops it back
  (`features/games/engine.ts`). Game level n = printable stage n (`features/curriculum/skills.ts`).
- **Stickers:** after every finished round the child picks a pack (Unicorns, K-pop Hunters, Ice Queen) and
  gets a sticker for their sticker book; perfect rounds give sparkly ones. Emoji art only, no film characters.
- **The garden** (`features/garden/garden-state.ts`): every finished round plants a flower — species by
  game, open as wide as the round was good — ten stickers bring a butterfly, the daily goal a rainbow, 50
  stickers a unicorn. It grows along the bottom of the home screen and opens full size when tapped. Derived
  from the round log, so it is identical on every device.
- **Grown-ups screen** (behind a sum, remembered for ten minutes so signing in doesn't ask twice): an
  **account panel** leading the screen — a full-width "☁️ Signed in" or "📱 Guest — this device only" bar,
  then the account address at heading size, whether anything is still waiting to upload, switch child, sign
  in or out. The panel exists because with a single child the app opens straight into her garden, so
  `ProfilesScreen` (the only other place naming the account) never renders, and there was no way to tell a
  signed-in session from a guest one. It leads rather than sits inline because as a pale pill with the
  address inside a sentence it read as a footnote, and "am I signed in, and as whom?" still took a paragraph
  to answer. Everything under it is a tap-to-open `Section` — how it's going, skills and levels, the weekly
  check-in, voice and name — each stating what it holds in one line ("6 of 8 games played · levels 1–3"), so
  the screen is readable without opening anything. Expanded, all of it ran for several phone-heights and
  whatever you came for was rarely on screen. The import offer is deliberately **not** behind a section: the
  point of it is to be seen without going looking.
- **Tutor report** (`features/report/`): a verdict and a plain-English note per skill, what to print next
  and why, off-screen practice for the weakest skills, and warning signs. Printable, and **emailed to the
  parent whenever a game crosses into a new printable stage** ("Tara has moved up to stage 2 in Counting
  objects") with links to the sheets that suit her weakest skills.
- **Progress over time** (`features/progress/history.ts`, `ProgressScreen`): totals, accuracy and
  seconds-per-answer by week, a square per day for the last eight weeks, and per skill a level ladder,
  weekly accuracy and every number asked coloured by how it goes. Charts are hand-drawn SVG — no charting
  library for five shapes. **Level changes are recorded as events** (`maths_level_events`: from, to, reason
  earned/dropped/manual/import), because `maths_levels` only holds the current level; history for older play
  falls back to inferring changes from the level of the next round, and says so. Rounds also store
  `levelMax`, so difficulty stays readable when levels are retuned.
- **How the scoring works** is one component (`ScoringDiagram`) shared by that screen and the
  `#/guides/how-it-scores` guide, so the explanation cannot drift from the code.
- **Guest import:** guest play belongs to a different child id, so signing in makes it vanish from view and
  look exactly like lost data (it isn't — nothing in the app ever deletes a progress cache). So a signed-in
  parent opening a child while guest play is still on the device gets **the offer before the garden**
  (`ImportPromptScreen`), not buried behind the grown-ups sum; "Not now" leaves it on the grown-ups screen.
  Records keep their ids, so importing twice changes nothing. A live session beats the `maths-garden:guest`
  flag in `app/App.tsx`: that flag is sticky, and while it was checked first, one tap of "carry on without
  an account" left every later open showing the guest app over a signed-in session — no account name, and
  no import offer, since guest mode passes `allowGuestImport={false}`. `#/login` beats the flag as well:
  while it did not, the sign-in form could not be reached at all from a device that had ever tapped guest
  mode, and the only route back to it was "Sign in to save →" on the grown-ups screen, behind the sum.
- **Offline-first:** every write lands in local storage first and uploads when there is signal
  (`features/progress/repo.ts`).
- **Printables** (`#/resources`, public, no sign-in): the Quick Peek dot card maker, plus counting mats,
  numeral cards + tracing + a number hunt, more-or-fewer cards, the one-more-unicorn story board, **bond
  frames**, **balloons that float away**, **ten-and-some-more cards** and the number track race
  (`#/resources/sheet?id=…&stage=…&name=…&icon=…`). Every sheet starts with a how-to page
  and carries a **QR code that opens the game checking the same skill** (`#/play/<game>`). "Print this
  stage's pack" (`#/resources/pack?…`) prints the whole set at the child's current stages.

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
  features/progress/      model (rounds, levels, level events), repo (outbox; tested), supabase-remote, memory-remote, probes, fixtures,
                          history (charts data; tested), charts (hand-drawn SVG), ScoringDiagram, ProgressScreen, SkillRow, CheckInPanel, DashboardScreen
  features/garden/        GardenApp (home, game, end, garden, report, sticker book, gate, grown-ups), garden-state (tested), GardenScene/GardenScreen
  features/curriculum/    skills.ts: nine skills × three stages (with typical ages), linked to games and probes
  features/marketing/     articles (the three guides + sources), faq, menu (printables by skill; tested), HomeScreen, ArticleScreen, MarketingLayout
  features/report/        report (verdicts, recommendations; tested), report-email (html + text; tested), send-report, ReportScreen
  features/resources/     catalog, ResourcesScreen, A4Page, qr (QR path + absolute links), pack (stage pack),
                          subitising/ (patterns, cards, card maker), sheets/ (catalog, eight sheet makers, SheetScreen)
supabase/                 config.toml, migrations/, functions/send-report (emails the report to the signed-in parent)
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

Supabase project `gzdfoptvdocauvgxltjk` (eu-west-1) on its own Supabase account, set up 11 Sep 2026.
Tables: `children`, `maths_rounds`, `maths_levels`, `maths_level_events`, `maths_checkins`,
`maths_stickers`; RLS gives a parent their own children and those children's rows only. Schema changes: add
a migration, apply it through the session pooler (the direct database host is IPv6-only), update
`src/shared/supabase/types.ts`. Intended auth settings are in `supabase/config.toml`.

Migrations 0001–0003 are applied. 0003 adds `maths_level_events` (every level change with its reason) and
`maths_rounds.level_max`; the app degrades gracefully if a history table is missing, so code can ship before
a migration runs.

**Report email.** `supabase/functions/send-report` posts the report to Resend. It takes the address from
the caller's own session, so it can only ever email the signed-in parent. Until it is deployed the app
still shows the report; sending just fails quietly.

```
npx supabase functions deploy send-report --project-ref gzdfoptvdocauvgxltjk
npx supabase secrets set RESEND_API_KEY=re_... REPORT_FROM='Maths Garden <onboarding@resend.dev>'
```

## Next

- Deploy `send-report` and set the Resend key, so stage-up emails actually go out.
- More sheets per stage (cut-and-stick, dot-to-dot, ten-frame bonds): provider research and work plan in
  the assistant repo, `me/projects/maths-garden/`.
- Games for the gaps: number bonds, teen numbers and place value, ordering, shapes and patterns.
- A daily quest round drawn from the weakest skills, instead of five silos.
