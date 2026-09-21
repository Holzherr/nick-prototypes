# Requirements

Nick's requirements for the piano app, captured from the build conversation of 13–15 Sep 2026. Goals and metrics live in [GOALS.md](GOALS.md); this file holds the product requirements and the background facts behind them.

## Objective

Nick can't read music well enough to tell Tara which key to press with which hand. The app does it: it takes the piece Louise set this week, from a photo of the book, and shows Tara one note at a time — which key, which hand, which finger.

## Requirements

1. **Both hands on screen all the time.** A left-hand and a right-hand panel are always visible, so a hand switch is something she can see coming. Swapping hands mid-tune is her longest-running difficulty (see Background).
2. **Hand setup shown on the panels.** Before playing, each panel shows where that hand rests on the keys and which finger sits on which note, and the keyboard shows resting finger badges.
3. **Sheet music can be shown or hidden.** It's a single line that scrolls to keep the current note in view, with a playhead marking her progress.
4. **No big note letter.** The large changing letter in the top-left corner was removed on purpose.
5. **Basic flow first.** The first release is a way to test one piece note by note. Add nothing beyond it until the flow has been tried with Tara.
6. **A real app built like Maths Garden.** React and Vite, feature-sliced `src/features/*`, and Storybook components for each piece of UI. Tests run on the music maths and the notation layout.
7. **Piano identity, not Maths Garden pink.** It has its own design system, recorded in [DESIGN.md](../DESIGN.md).
8. **Easy to open for Tara.** It's hosted at https://nickholzherr.com/piano (noindex) as an installable PWA that works offline. Sound comes from a Web Audio synth, so there are no sample files.
9. **Hand colours match Louise's.** She colours the right hand orange and the left hand green in Tara's book, and the app does the same.

## Background facts

- **Teacher:** Louise Harper. She gives a weekly lesson in term time.
- **Book:** *Tunes for Ten Fingers* (Pauline Hall, OUP) is the main method. It's used alongside the sticker book *Music Theory Made Easy for Little Children*. She finished *Dogs & Birds Book 1* on 18 Mar 2026. She isn't working towards a grade yet.
- **Current piece:** This Old Man, p.43, set on 10 Sep 2026.
- **Hand position:** Middle-C position. Right hand C D E F G is fingers 1–5. Left hand C B A G F is fingers 1–5. Both thumbs share middle C.
- **Louise's method:** sing it, point at each note, say the letter name, then play. Writing letters on the score is fine for a performance.
- **Hand-shape cue:** "Mouse", an imaginary mouse kept under the bridge of her curved hand.
- **Known confusion:** she mixes up D and E (noted 11 Jun 2026).

## Syncing Louise's notes

Louise's lesson notes arrive in Nick's personal Gmail, sent by Involve (formerly Practice Pal) with the subject "New message from Louise Harper". They are copied into `personal/tutor-tara/piano-log.md` in the private assistant repo. The log is kept private because this repo is public. It holds the lesson-by-lesson record, the order she learned her notes, and the books.

When a new lesson email arrives:

1. Search Gmail for the subject above, and append the lesson to the log.
2. If Louise set a new piece, transcribe it from a photo of the book into `src/features/score/pieces/`, with `verified: false`.
3. Nick checks the transcription against the book before `verified: true` is set, as recorded in [DECISIONS.md](DECISIONS.md).

## Transcription

A score is stored as notes, each with a MIDI pitch, an onset and duration in beats, a hand, a finger and a lyric. To read pitches from the photo, anchor on the ledger line (middle C) and on the printed finger numbers. Then check that the total length adds up to the bar count.

## Parked ideas from Louise's notes

None of these are built. Each is waiting for Nick to pick it:

1. Say each note name aloud before it's played. This is the thing Louise asks for most.
2. A sing-first mode.
3. Extra help telling D and E apart.
4. A practice calendar or streak, which could be the tamagotchi reward, with Mouse as the character.
5. A library of past pieces, since Louise says to replay earlier tunes.
