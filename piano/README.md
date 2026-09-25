# Tara at the Piano

Note-by-note practice for the piece Tara is learning this week, built from a
photo of her lesson book. Published to `nickholzherr.com/piano`.

```
npm run dev          # vite
npm test             # vitest - the score model and staff layout
npm run storybook    # component gallery on :6009
npm run build        # VITE_BASE=/piano/ npm run build to publish
```

## Layout

- `features/score` - the piece as data, plus the pure music helpers and their tests.
  A piece is MIDI pitch + beats, never seconds, so the tempo slider cannot corrupt it.
- `features/notation` - grand-staff geometry (`layout.ts`, tested) and the `Staff` renderer.
- `features/keyboard` - the keyboard, including the resting finger badges.
- `features/hands` - the two hand panels.
- `features/practice` - state, guidance line, note strip, transport, and the session log (`sessionLog.ts`, localStorage; `?sessions` shows it as JSON).
- `features/audio` - a small additive synth; no samples, so it works offline.

## Backend

Piano has no Supabase project of its own: `supabase/migrations/0001_piano_sessions.sql` (written, **not
applied**) goes into the Maths Garden project, which already has the `agent_reader` role the nightly
report signs in with. One table, `piano_sessions` (`device_id`, `session_id`, `piece_id`, `day`,
`reached_last`, `correct_presses`, `updated_at`; primary key device + session). RLS lets the anon key
insert and update a row and never select or delete one, so a device writes with an upsert and nobody can
read the table back through the API. "Own device only" is not enforceable without sign-in; the row key is
a random UUID the device made. A row holds no name and no time finer than a day. Nothing in `src/` writes
it yet (that client is PN-007).

`piano_snapshot(days int default 7) returns jsonb` is the only way the report reads it: `security
definer`, executable by `agent_reader` alone, `days` clamped to 1–400.

```json
{
  "generated_at": "2026-09-25T21:00:00+00:00",
  "days": 8,
  "sessions_7d": 2,
  "sessions_by_day": [{ "day": "2026-09-23", "sessions": 1, "runs": 3 }]
}
```

`sessions_7d` is G-11's metric: rows with `reached_last` whose `day` is today or one of the six days
before it. That window is fixed at 7 calendar days whatever `days` is, because the runner calls the
function with 8 and the target is 2 a week. `days` only widens `sessions_by_day`: one entry per day with
at least one row in the last `days` days, oldest first, `sessions` = reached the last note, `runs` = every row.

Nick's three steps, once this and PN-007 are merged:

1. apply the migration through the pooler
2. set the piano publish workflow's `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` to the Maths Garden project's values
3. add the `supabase` block with `snapshot_function: piano_snapshot` to `apps/piano/app.json`

## Adding a piece

Add a file under `features/score/pieces`, fill in the notes, and point `App.tsx`
at it. `music.test.ts` will check the bars add up and that every note falls under
the finger the hand position assigns it. Leave `verified: false` until a human
has compared it against the book - a wrong transcription tells Tara she is wrong
when she is right, which is the worst thing this app could do.
