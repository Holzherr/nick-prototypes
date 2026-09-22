# Maths Garden

Early-maths games for four-year-olds, plus free printables that feed them. Paper cards teach a stage at
home; the games on an iPad or phone check it, score every round and move the child up a level, which
unlocks the next stage's printables. Built for Tara (4). Started as a single HTML file from a claude.ai
chat on 11 Sep 2026 and moved into this structure the same day. Conventions mirror `../qeued-next` and
[TigerWorkouts](https://github.com/Holzherr/tigerworkouts) (and GitLaw's front-law repo).

- **Live:** https://nickholzherr.com/maths/ (published by `.github/workflows/maths.yml` in Holzherr/nickholzherr.com;
  run `gh workflow run maths.yml -R Holzherr/nickholzherr.com` after merging here)
- **Homepage (signed out):** https://nickholzherr.com/maths/#/home · **sign in:** `#/login` · **the app:** `#/app`
- **Free printables (no sign-in):** https://nickholzherr.com/maths/#/resources
- **Guides:** `#/guides/stages`, `#/guides/gamified-learning` and `#/guides/how-it-scores`
- **What this device is running:** `#/diagnostics` — build id, bundle, service worker, signed-in account,
  what is still waiting to upload, and any guest play on the device. Public and above `AuthProvider` on
  purpose: it is needed most when signing in is the thing that is broken. No keys or tokens, so it is safe
  to screenshot. Linked from the build stamp in the grown-ups footer. An iPad once served the first-day
  build for hours while fixes were published over it, with nothing on screen to say so — every instruction
  given was impossible to follow, and it took six exchanges and a photo to find. Stuck that way?
  `/maths-reset.html` clears the cached app and leaves saved play alone.
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
  **On a phone the header is one row** (`MarketingLayout`): the theme tile, one "Menu" button holding
  Free printables, How it works, Guides, FAQ and the language picker, and Sign in beside it. Below
  Tailwind's `sm` the links used to wrap to two rows, so a child creating a profile met six adult links
  before the name field. The width is read through `matchMedia` rather than `hidden sm:flex`, so only one
  header is ever in the DOM and a test can render either (`MarketingLayout.test.tsx`); jsdom has no
  `matchMedia`, and without one the wide header is assumed. The front door (`StartCard`) offers the icon
  one way: the picker row directly under the big tile, which is now a preview and not a button — it used
  to cycle themes on tap as well, with a "Tap to change" caption, three controls for one choice.
- **Parent account** (Supabase email + password) with **child profiles**. The device remembers the child
  and opens straight into their garden; the parent stays signed in.
- **Nine games**, five questions a round, **six levels each**: Quick Peek (subitising), Count With Me, Find
  the Number, Which Has More?, One More Unicorn, **Make Ten** (number bonds, on a five/ten frame and then
  without one), **One Fewer** (taking away, watching balloons go), **Ten and Some More** (the teens as
  ten-and-something) and **Spot the Shape** (names shapes, then counts their sides). Spoken prompts in a
  British voice, stars, praise by name. Levels 1–3 are the printable stages; 4–6 are challenge levels, and
  the sixth is the **gold level** — clearing it with a perfect round masters the game.
- **Getting a better voice** (`VoicePanel`): the app can only choose from the voices installed on the
  device, and on one with nothing downloaded that is the thin compact voice — no respelling fixes that.
  `hasEnhancedVoice()` checks whether a Premium/Enhanced English voice is actually present and the panel
  says which case you are in, so a parent is never sent to Settings to discover they were already done, nor
  told all is well while the app speaks in the basic voice. When there is none, **✨ Enhance the voice**
  opens the numbered iOS walkthrough in place (Settings → Accessibility → Spoken Content → Voices →
  English → English (United Kingdom) → download one marked Enhanced or Premium), with Mac and Android
  equivalents underneath. It replaced a single dense line of instructions, which is a good way to be
  ignored. iOS fires `voiceschanged` when the download finishes, so returning to this screen flips the
  status without a reload.
- **Saying the name right** (`features/games/sound.ts`): the best English voice is picked automatically —
  downloaded Premium/Enhanced first, then en-GB, novelty voices excluded — but a name still lands wrong as
  often as not. There is no phoneme control to reach for: Safari's speech API takes neither SSML nor IPA, so
  respelling the word is the only lever, and which respelling works depends on the voice installed on that
  device. `nameCandidates` offers a shortlist instead of guessing — the name as written, then a longer vowel
  ("Tahra"), a shorter one ("Tarra") and a two-beat form ("Tah-ra") — and the grown-ups screen speaks each on
  tap, so it is settled by ear in two taps. Typing a spelling by hand still works.
- **Leaving a round pauses it** (`GameScreen` → `GardenApp`): the 🏠 button sits at a child's fingertip and
  fires on one tap, and it used to bin a half-finished round with no way back. It now hands the whole round
  out — questions, place and answers — which `GardenApp` holds (above `GameScreen`, which dies on exit), and
  home offers "Carry on" above everything else. The round is only written as abandoned when she actually
  starts a different game, so the frustration signal survives without a stray tap costing her the round.
  Abandoned rounds never counted towards levels or accuracy anyway — `roundsOf` filters on `finished` — they
  only show as "n left early" in the week summary.
- **Home leads with one suggested game** (`features/games/recommend.ts`) and its reason, with the rest
  behind "Or pick another game": never played wins outright, then not played today, weak accuracy,
  staleness, and a boost when one good round would level it up — minus whatever was just played, so the
  suggestion moves on by itself.
- **Levelling:** a perfect round, or two in a row at 80%+, moves a game up; two under 50% drops it back
  (`features/games/engine.ts`). Game level n = printable stage n (`features/curriculum/skills.ts`).
  Being accurate but slow no longer holds a level indefinitely: a perfect round only waits when the round
  before it was slow as well, and **four good rounds in a row move up whatever the pace**. She played 55
  rounds at 94% and moved up seven times — "stay and build speed" is a fair nudge for a round or two and a
  trap for ever. **Mastery** (`mastered`) is a perfect, non-slow round at the top level: gold level dots and
  a trophy on the tile, a line on the end screen and a gold sticker from Nova. It is derived from the round
  log, so it needs no migration and reads the same on every device.
- **Stickers:** after every finished round the child picks a pack and gets a sticker for their sticker book;
  perfect rounds give sparkly ones. Emoji art only, no film characters. **Eight packs of eight**, unlocked
  by *breadth* — a stage reached in a number of games, not the best single game (`unlockedPacks`, `PackUnlock`):
  Unicorns, K-pop Hunters and Ice Queen from the start, **Space** at stage 2 in two games, **Under the Sea**
  at stage 2 in four, **Dinosaurs** at stage 3 in two, **In the Garden** at stage 3 in seven and **Night Sky**
  at stage 3 in all nine. Unlocking on the best single game meant one game hitting stage 3 opened the whole
  catalogue at once, which is how 48 stickers became collectable in an afternoon. Three packs looked like a
  fortnight of collecting and lasted two days — the unicorn and K-pop packs were both complete *and*
  sparkly-complete by the second evening, after which `drawReward` could only hand back duplicates, which is
  what makes stickers feel cheap. The sticker book counts against `stickerTotal(stage)`, never the whole
  catalogue: a locked pack must add nothing, or finishing everything reachable would still read as half a
  collection. Locked packs are not shown in the chooser either — it appears seconds after a round, and
  offering a four-year-old something she cannot have is worse than meeting the pack when it arrives. Pack and
  sticker ids are a contract (`maths_stickers.sticker` stores `"<pack>/<name>"`), so they are covered by a
  test and must never be renamed.
- **Winding down** (`breakSuggestion` → `GardenHome`): after eight finished rounds in a day — or two poor
  rounds, two quits, or a sudden slow-down — home leads with one short line ("Lots of playing today!", six
  words or fewer, `WIND_DOWN`) and one pink button, "See my garden", with the sticker book in cream beside it;
  the suggested game and its "Or pick another game" toggle are folded behind a faint "Or one more if you
  like". A paused round outranks it: "Carry on" is then the one pink button and the garden goes cream, so the
  quit-then-home path never shows two. Grown-ups sits last in the flow rather than fixed bottom-right, where
  it used to cover the suggested game's title on a phone. The signal already
  existed and did nothing: the end screen flipped its buttons and said "time for a little break", then
  returned her to a home screen identical to round one, whose loudest element was "Let's play this one!".
  Tara did 21 rounds in a day against a goal of 3, so `breakSuggestion` had been returning `lots` for her
  last thirteen rounds with no visible effect. It stays a nudge, never a cap: blocking a four-year-old
  mid-flow is a worse moment than letting her choose, and the wording is aimed at her rather than the parent.
- **The garden** (`features/garden/garden-state.ts`): every finished round plants a flower — species by
  game, open as wide as the round was good — ten stickers bring a butterfly, **25 rounds a tree**, the daily
  goal a rainbow, 50 stickers a unicorn and **120 a pond with a duck on it**. It grows along the bottom of
  the home screen and opens full size when tapped. Derived from the round log, so it is identical on every
  device. The bed holds 42 flowers and butterflies run to 16: it used to stop at 30 and 8, with the unicorn
  at 50 the last thing that ever happened, so a child who kept playing was tending a garden that had
  finished. Trees and the pond arrive long after the unicorn, and `GardenScreen` always names the next one.
- **Grown-ups screen** (`#/grown-ups`, behind a sum): the one in-app screen with a hash of its own, so a
  parent reading it can refresh — or link straight to it — instead of being dropped back into the child's
  garden; the rest are steps in a child's play, where a refresh should not resume a half-finished round. The
  hash is swapped with `replaceState`, so Back leaves the app rather than walking these screens. Passing the
  sum is remembered for ten minutes in **`sessionStorage`**: signing in from this screen rebuilds the whole
  tree, and a refresh throws away every module, so a module variable meant answering a second sum to get
  back to the screen you were already on. sessionStorage survives both and still dies with the tab, so a
  child opening the app fresh meets the gate. The footer prints the **build id** — a device can serve a
  cached build for days with nothing on screen to say so (an iPad served the first build for hours while
  fixes were published over it), and one glance now answers it. Leading the screen is an
  **account panel** — a full-width "☁️ Signed in" or "📱 Guest — this device only" bar,
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
- **Two tests earn their place by reproducing bugs that shipped green.** `app/routing.test.tsx` mounts the
  real `App` with a mocked Supabase session and checks what an open of the app lands on: a live session must
  beat the sticky guest flag, and `#/login` must reach the sign-in form even when that flag is set. Both of
  those broke in production, neither could be caught below `Root`, and the second made signing in impossible
  from any device that had ever tapped guest mode. `features/garden/import-flow.test.tsx` mounts `GardenApp`
  against `memoryRemote` with guest keys in local storage and walks the import: the offer comes before the
  garden, names the rounds and stickers, copies them keeping their ids, and stops offering once they have
  landed — decided by comparing records, never by a flag, because a flag is what hid a child's play for good.
  No browser runner: the app already runs against an in-memory server (`GardenApp.stories.tsx` does the same),
  so these are plain vitest files that cost nothing in CI.
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
cp .env.example .env.local   # optional: your own Supabase project; blank runs without accounts
npm install
npm run storybook        # component workbench on :6008
npm run dev              # the app on :5173/nick-prototypes/maths-garden/
npm test
npm run check-types && npm run lint
npm run build && npm run build-storybook   # what CI does; output in dist/
```

Story conventions: CSF3, `satisfies Meta<typeof X>`, and a `parameters.docs.description.component` that
describes the visual layout. `Screens/Garden (playable)` runs the whole child app against an in-memory server.

## Backend

A Supabase project of its own. The app reads its address and publishable key from `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` (`.env.local` locally; `MATHS_SUPABASE_URL`/`MATHS_SUPABASE_ANON_KEY` repo variables in
the publish workflows). Without them it runs guest-only. To stand up your own: apply `supabase/migrations/` in order.
Tables: `children`, `maths_rounds`, `maths_levels`, `maths_level_events`, `maths_checkins`,
`maths_stickers`, `maths_events`, `maths_feedback`; RLS gives a parent their own children and those
children's rows only.
Schema changes: add a migration, apply it through the session pooler (the direct database host is
IPv6-only), update `src/shared/supabase/types.ts`. Intended auth settings are in `supabase/config.toml`.

Migrations 0001–0004 are applied. 0003 adds `maths_level_events` (every level change with its reason) and
`maths_rounds.level_max`; the app degrades gracefully if a history table is missing, so code can ship before
a migration runs.

**Feedback labels** (migration 0007, written, **not applied**): `maths_feedback.reporter` (one of Nick,
Priyanka, Tara, remembered on the device under `maths-garden:feedback-reporter`) and `maths_feedback.kind`
(`bug`, `idea` or `tara-noticed`), both nullable, RLS unchanged. The form offers each as three chips and no
free text. Until 0007 is applied the labelled insert is refused, so `sendFeedback` retries once without the
two columns and the message still lands. Story: Screens/Feedback.

**Agent snapshot** (migration 0008, applied 2026-09-20; migration 0009 adds `total_ms`, `eased` and `stickers`,
applied 2026-09-21). `agent_snapshot(days int) returns jsonb` is
the only way the team's Analyst reads this database: one `security definer` function, and one login role
`agent_reader` holding EXECUTE on that function and no grant on any table, so widening what it sees takes a
migration rather than a grant. Child ids come back as `md5(child_id::text)`, `children.name` is never read,
and feedback carries the message, path, locale and time only — no reply address, no session id — so the
output is safe to paste into a report. To turn it on: apply the migration, set the role's password by hand
(it is deliberately not in the file, which is public), then store the connection string in the keychain
under `agent-team-maths-garden-db`; the shape is in the migration's header comment. Nothing in `src/` calls
it and the app does not change when it is applied. Six sections:

```json
{
  "generated_at": "2026-09-20T21:00:00+00:00",
  "days": 7,
  "rounds": [{ "day": "2026-09-20", "game": "bond", "level": 3, "child": "9f86d081884c…",
               "rounds": 4, "completed": 3, "accuracy": 0.850, "median_ms": 4200,
               "total_ms": 96000, "eased": 2 }],
  "quits": [{ "game": "bond", "quits": 1 }],
  "level_events": [{ "day": "2026-09-20", "game": "bond", "reason": "earned", "changes": 1 }],
  "events": [{ "day": "2026-09-20", "name": "round_done", "events": 12, "sessions": 3 }],
  "feedback": [{ "message": "the voice reads the numbers too fast", "path": "/#/app",
                 "locale": "en", "at": "2026-09-20T19:40:00+00:00" }],
  "stickers": [{ "day": "2026-09-20", "child": "9f86d081884c…", "earned": 3, "shiny": 1, "duplicates": 1 }]
}
```

`rounds` is per day × game × level × child, `accuracy` is `sum(score)/sum(total)` and `median_ms` the median
over every answer's time, not over round averages; `total_ms` is the sum of every answer's `totalMs` (whole
question, prompt to tap; `ms` when a round predates it), so minutes played is `total_ms / 60000`; `eased`
counts answers asked from the level below after two misses; `quits` counts rounds left early
(`completed = false`) per game. `stickers` is per day × child: `earned` draws, `shiny` of them perfect-round,
`duplicates` of them a sticker the child already held from an earlier draw. `days` is clamped to 1–400 and
defaults to 7.

**Counting** (`features/analytics/events.ts`, migration 0004). Anonymous and first-party: how many people
arrive, sign up and play. No cookies, no third party, no script from anyone else, and no identifier that
outlives the browser tab — the session id is random and lives in `sessionStorage`. Events: `visit`,
`signup`, `sign_in`, `guest_start`, `game_start`, `round_done`, `offer_taken`, `offer_skipped`.
`offer_taken`: a start from home of the game home suggested. `offer_skipped`: a start from home of a
different game, behind "Or pick another game". Both fire alongside `game_start`; "Play again", a sheet's
QR link and carrying on a paused round record neither, so per day
`offer_skipped / (offer_taken + offer_skipped)` is how often the suggestion is passed over.

Three rules make it safe to keep on a children's site, and each is load-bearing:

- **A printable's link carries the child's NAME and avatar** (`#/resources/sheet?id=…&name=Tara&icon=🦄`),
  so `cleanPath` is an allowlist — only `id` and `stage` survive — and it is tested as one. Recording a raw
  path would put a four-year-old's name in an analytics table.
- **Guest mode records nothing at all.** The homepage promises "Guest mode keeps everything on the device
  and sends nothing anywhere"; `track()` returns early when the guest flag is set, so that stays true. The
  cost is that guest play is invisible, which is the right trade.
- **`maths_events` has an insert policy and no select policy**, so a signed-out visitor can record one and
  nobody can read the site's traffic back out through the API. Counts are for the project owner in SQL.

`track()` never throws, never blocks and never reports a failure — a counter must not be able to spoil a
round. It is also off on localhost and when Do Not Track is set. Reading the numbers:

```sql
select date_trunc('day', at) as day, name, count(*), count(distinct session) as sessions
from maths_events group by 1, 2 order by 1 desc, 2;
```

Raw traffic (visits, referrers, countries) needs nothing in the page: the domain is behind Cloudflare, so
it is already counted at the edge and lives in the Cloudflare dashboard.

**Report email.** `supabase/functions/send-report` posts the report to Resend. It takes the address from
the caller's own session, so it can only ever email the signed-in parent. **Deployed 13 Sep 2026** through
the dashboard's in-browser editor: the Supabase CLI on this machine is signed in to a different account and
gets 403 on this project ref, so the commands below only work once logged in as the account that owns it.
Until `RESEND_API_KEY` is set the function answers 501 ("Email is not set up yet") and the app carries on —
the report is still on the grown-ups screen.

Verified after deploying, without credentials: `OPTIONS` returns 200 carrying this function's own CORS
headers (`authorization, x-client-info, apikey, content-type`), which is proof the deployed code is *this
file* and not merely that something answers; an unauthenticated `POST` returns 401 rather than the 404 it
gave before.

**Unverified, worth checking on the first real send.** The function has **Verify JWT with legacy secret**
ON, while `/auth/v1/.well-known/jwks.json` publishes an ES256 key and the app ships an `sb_publishable_…`
key rather than a legacy `eyJ…` anon key. If user tokens are signed asymmetrically, that toggle rejects
them at the platform gate *before* the function runs, and every send fails 401 however good the Resend key
is. The fix is to turn it off: this function does its own auth (no `Authorization` header → 401,
`getUser()` → 401, recipient taken from the session and never from the body), which is exactly the case
Supabase's own note calls "Recommended: OFF with JWT and custom auth logic in your function code". It is
unconfirmed because the dashboard's function settings page would not render — three routes gave a partial
render, a blank page, and a list stuck on skeletons.

```
npx supabase functions deploy send-report --project-ref <project-ref>
npx supabase secrets set RESEND_API_KEY=re_... REPORT_FROM='Maths Garden <onboarding@resend.dev>' \
  REPORT_ORIGINS='https://nickholzherr.com,http://localhost:5173'
```

## Next

- **Redeploy `send-report` before setting `RESEND_API_KEY`.** The code in this repo is hardened (confirmed
  address only, payload caps, CORS limited to `REPORT_ORIGINS`, mail-service errors logged not echoed); the
  deployed copy predates that. Still open: a per-user send limit, and building the HTML server-side instead
  of taking it from the client — today the HTML can only reach the sender's own confirmed inbox.
- Then set `RESEND_API_KEY` so stage-up emails go out. If the first send fails 401, turn off "Verify JWT
  with legacy secret" on the function (see **Report email** above).
- More sheets per stage (cut-and-stick, dot-to-dot, ten-frame bonds): provider research and work plan in
  the assistant repo, `me/projects/maths-garden/`.
- Games for the remaining gaps: place value, ordering and patterns. Number bonds (Make Ten), teen numbers
  (Ten and Some More) and shapes (Spot the Shape) now have games of their own.
- A daily quest round drawn from the weakest skills, instead of five silos.
