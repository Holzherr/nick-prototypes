import type { Finger, Hand, Note, Piece } from './types.ts';

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const WHITE_CLASSES = [0, 2, 4, 5, 7, 9, 11];

/** Diatonic step per pitch class, used to place a note on a staff. */
const DIATONIC = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

export const FINGER_NAMES: Record<Finger, string> = {
  1: 'thumb',
  2: 'pointing finger',
  3: 'middle finger',
  4: 'ring finger',
  5: 'little finger',
};

export const letterOf = (pitch: number) => NAMES[pitch % 12];
export const isWhite = (pitch: number) => WHITE_CLASSES.includes(pitch % 12);
export const octaveOf = (pitch: number) => Math.floor(pitch / 12) - 1;
export const diatonicOf = (pitch: number) => Math.floor(pitch / 12) * 7 + DIATONIC[pitch % 12];
export const frequencyOf = (pitch: number) => 440 * Math.pow(2, (pitch - 69) / 12);

export function nextWhite(pitch: number, direction: 1 | -1) {
  let p = pitch + direction;
  while (!isWhite(p)) p += direction;
  return p;
}

/** Which key each finger rests on, walking out from the thumb. */
export function positionMap(piece: Piece, hand: Hand): Record<Finger, number> {
  const step = hand === 'R' ? 1 : -1;
  let p = piece.handPosition[hand].thumb;
  const map = {} as Record<Finger, number>;
  for (const f of [1, 2, 3, 4, 5] as Finger[]) {
    map[f] = p;
    p = nextWhite(p, step);
  }
  return map;
}

/** Which letter each finger actually plays in this piece, for the ones it uses. */
export function fingersUsed(piece: Piece, hand: Hand): Partial<Record<Finger, string>> {
  const used: Partial<Record<Finger, string>> = {};
  for (const n of piece.notes) if (n.hand === hand) used[n.finger] = letterOf(n.pitch);
  return used;
}

/** White keys between two pitches, signed. Positive means to the right. */
export function whiteDistance(from: number, to: number) {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  let n = 0;
  for (let p = lo + 1; p <= hi; p++) if (isWhite(p)) n++;
  if (n === 0) return 0; // same key: avoid -0
  return to > from ? n : -n;
}

export const barOf = (piece: Piece, note: Note) => Math.floor(note.onset / piece.beatsPerBar);
export const barCount = (piece: Piece) =>
  piece.notes.length === 0 ? 0 : barOf(piece, piece.notes[piece.notes.length - 1]) + 1;

/** Total beats, used to check a transcription adds up to whole bars. */
export const totalBeats = (piece: Piece) =>
  piece.notes.reduce((sum, n) => sum + n.duration, 0);

/** One short sentence telling her what to do next. Explains, never judges. */
export function guidance(piece: Piece, index: number): string {
  const n = piece.notes[index];
  const prev = index > 0 ? piece.notes[index - 1] : undefined;
  const letter = letterOf(n.pitch);

  if (!prev) return `Put your ${FINGER_NAMES[n.finger]} on ${letter} and play it.`;
  if (prev.hand !== n.hand) {
    return `Swap hands - now the ${n.hand === 'R' ? 'right' : 'left'} hand plays ${letter}.`;
  }
  if (prev.pitch === n.pitch) return `Same key again - stay on ${letter}.`;

  const steps = whiteDistance(prev.pitch, n.pitch);
  const direction = steps > 0 ? 'up' : 'down';
  const count = Math.abs(steps);
  return `${count === 1 ? 'One key' : `${count} keys`} ${direction} to ${letter}.`;
}

/** How long to hold, in Louise's words. */
export function holdLabel(note: Note) {
  if (note.duration < 1) return 'half a count';
  return note.duration === 1 ? '1 count' : `${note.duration} counts`;
}
