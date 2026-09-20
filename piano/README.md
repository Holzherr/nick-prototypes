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

## Adding a piece

Add a file under `features/score/pieces`, fill in the notes, and point `App.tsx`
at it. `music.test.ts` will check the bars add up and that every note falls under
the finger the hand position assigns it. Leave `verified: false` until a human
has compared it against the book - a wrong transcription tells Tara she is wrong
when she is right, which is the worst thing this app could do.
