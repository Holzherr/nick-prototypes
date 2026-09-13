import type { Piece } from '../types.ts';

/** Transcribed from a photo of page 43 of Tunes for Ten Fingers, 13 Sep 2026.
 *  The melody passes between the hands almost every note - that is the whole
 *  difficulty of the piece, and what the app exists to show.
 *  The book prints only two fingerings, a 2 in bar 1 and a 4 at "nack"; both
 *  agree with middle-C position, which is where the rest come from. */
export const thisOldMan: Piece = {
  id: 'this-old-man',
  title: 'This Old Man',
  source: "Tunes for Ten Fingers, page 43",
  tempoBpm: 76,
  beatsPerBar: 4,
  handPosition: { R: { thumb: 60 }, L: { thumb: 60 } },
  range: { low: 53, high: 69 },
  verified: false,
  notes: [
    { pitch: 62, onset: 0, duration: 1, hand: 'R', finger: 2, lyric: 'This' },
    { pitch: 59, onset: 1, duration: 1, hand: 'L', finger: 2, lyric: 'old' },
    { pitch: 62, onset: 2, duration: 2, hand: 'R', finger: 2, lyric: 'man,' },

    { pitch: 62, onset: 4, duration: 1, hand: 'R', finger: 2, lyric: 'he' },
    { pitch: 59, onset: 5, duration: 1, hand: 'L', finger: 2, lyric: 'played' },
    { pitch: 62, onset: 6, duration: 2, hand: 'R', finger: 2, lyric: 'one,' },

    { pitch: 64, onset: 8, duration: 1, hand: 'R', finger: 3, lyric: 'He' },
    { pitch: 62, onset: 9, duration: 1, hand: 'R', finger: 2, lyric: 'played' },
    { pitch: 60, onset: 10, duration: 1, hand: 'L', finger: 1, lyric: 'nick' },
    { pitch: 59, onset: 11, duration: 1, hand: 'L', finger: 2, lyric: 'nack' },

    { pitch: 57, onset: 12, duration: 1, hand: 'L', finger: 3, lyric: 'on' },
    { pitch: 59, onset: 13, duration: 1, hand: 'L', finger: 2, lyric: 'my' },
    { pitch: 60, onset: 14, duration: 2, hand: 'L', finger: 1, lyric: 'drum,' },

    { pitch: 62, onset: 16, duration: 1, hand: 'R', finger: 2, lyric: 'Nick' },
    { pitch: 55, onset: 17, duration: 1, hand: 'L', finger: 4, lyric: 'nack' },
    { pitch: 55, onset: 18, duration: 0.5, hand: 'L', finger: 4, lyric: 'pad-' },
    { pitch: 55, onset: 18.5, duration: 0.5, hand: 'L', finger: 4, lyric: 'dy-' },
    { pitch: 55, onset: 19, duration: 1, hand: 'L', finger: 4, lyric: 'wack,' },

    { pitch: 55, onset: 20, duration: 0.5, hand: 'L', finger: 4, lyric: 'give' },
    { pitch: 57, onset: 20.5, duration: 0.5, hand: 'L', finger: 3, lyric: 'a' },
    { pitch: 59, onset: 21, duration: 0.5, hand: 'L', finger: 2, lyric: 'dog' },
    { pitch: 60, onset: 21.5, duration: 0.5, hand: 'L', finger: 1, lyric: 'a' },
    { pitch: 62, onset: 22, duration: 2, hand: 'R', finger: 2, lyric: 'bone,' },

    { pitch: 62, onset: 24, duration: 1, hand: 'R', finger: 2, lyric: 'This' },
    { pitch: 59, onset: 25, duration: 1, hand: 'L', finger: 2, lyric: 'old' },
    { pitch: 59, onset: 26, duration: 1, hand: 'L', finger: 2, lyric: 'man' },
    { pitch: 60, onset: 27, duration: 1, hand: 'L', finger: 1, lyric: 'came' },

    { pitch: 59, onset: 28, duration: 1, hand: 'L', finger: 2, lyric: 'roll-' },
    { pitch: 57, onset: 29, duration: 1, hand: 'L', finger: 3, lyric: 'ing' },
    { pitch: 55, onset: 30, duration: 2, hand: 'L', finger: 4, lyric: 'home!' },
  ],
};
