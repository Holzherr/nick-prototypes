# Requirements

This file holds Nick's own requests for the piano app, taken from the build conversation of 13–15 Sep 2026, along with background facts from Louise's lesson emails. Goals and metrics are kept in [GOALS.md](GOALS.md).

## Objective

Tara practises the piece from her lesson book. Nick doesn't know which keys to tell her to press, or with which hand. The app guides her through it visually and interactively.

## What Nick asked for

1. Show the left and right hands all the time, so it's clear when to switch.
2. Show the hand placement on each hand panel, so she can set up on the keys.
3. Sheet music can be shown or hidden, with her progress played along it.
4. The sheet music is one line that scrolls along.
5. No big changing letter in the top-left corner.
6. Hosted at https://nickholzherr.com/piano, so it's easy to open for Tara.
7. Built as an app similar to the Maths Garden setup, with Storybook components.
8. No extra features yet. Test the basic flow first.
9. Keep the piano identity rather than the Maths Garden design system.
10. Keep a log of Louise's lesson notes as context for how Tara is progressing.

## Background facts (from Louise's emails)

- **Teacher:** Louise Harper, with a weekly lesson in term time.
- **Books:** *Tunes for Ten Fingers* (Pauline Hall, OUP) and the sticker book *Music Theory Made Easy for Little Children*. She finished *Dogs & Birds Book 1* on 18 Mar 2026. No grade yet.
- **Current piece:** This Old Man, p.43, set on 10 Sep 2026.
- **Hand position:** middle C. Right hand plays C D E F G with fingers 1–5. Left hand plays C B A G F with fingers 1–5.
- **Hand swaps:** swapping hands mid-tune is the difficulty that comes up most often, from Oct 2025 to Sep 2026. Louise colours the right hand orange and the left hand green in Tara's book.
- **Louise's method:** sing it, point at each note, say the letter name, then play.
- **Hand-shape cue:** "Mouse", kept under the bridge of her curved hand.
- **Mix-up to watch:** she confuses D and E (noted 11 Jun 2026).

## Syncing Louise's notes

The notes come into Nick's personal Gmail from Involve, with the subject "New message from Louise Harper". They're logged in `personal/tutor-tara/piano-log.md` in the private assistant repo, which isn't kept here because this repo is public. When a new email arrives, add the lesson to that log. If Louise has set a new piece, it becomes the next score for the app.
