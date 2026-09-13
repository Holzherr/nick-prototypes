import { barCount, barOf, diatonicOf } from '@/features/score/music.ts';
import type { Hand, Note, Piece } from '@/features/score/types.ts';

/** Geometry of the grand staff, in SVG units. One continuous line: the score
 *  scrolls sideways rather than wrapping, so the reading order never breaks. */
export const STAFF = {
  pad: 96,
  barWidth: 190,
  top: 18,
  height: 196,
  /** Gap between staff lines. */
  lineGap: 10,
  /** Treble staff sits at y 0-40, bass at y 90-130, lyrics at 168. */
  trebleTop: 0,
  bassTop: 90,
  lyricY: 168,
  zoom: 1.1,
} as const;

/** E4 sits on the bottom treble line; A3 sits on the top bass line. */
const TREBLE_ANCHOR = { pitch: 64, y: 40 };
const BASS_ANCHOR = { pitch: 57, y: 90 };

export function staffY(pitch: number, hand: Hand) {
  const a = hand === 'R' ? TREBLE_ANCHOR : BASS_ANCHOR;
  return a.y - (diatonicOf(pitch) - diatonicOf(a.pitch)) * (STAFF.lineGap / 2);
}

export interface LaidNote {
  index: number;
  note: Note;
  x: number;
  y: number;
  /** Stems point up on the treble staff, down on the bass. */
  stemUp: boolean;
  /** Ledger line heights, empty when the note sits on the staff. */
  ledgers: number[];
  /** Index of the note this one is beamed to, or null. */
  beamTo: number | null;
}

function ledgersFor(y: number, stemUp: boolean) {
  const out: number[] = [];
  if (stemUp) {
    for (let yy = STAFF.trebleTop + 50; yy <= y; yy += STAFF.lineGap) out.push(yy);
  } else {
    for (let yy = STAFF.bassTop - 10; yy >= y; yy -= STAFF.lineGap) out.push(yy);
  }
  return out;
}

export function layout(piece: Piece): LaidNote[] {
  const laid = piece.notes.map((note, index) => {
    const bar = barOf(piece, note);
    const beat = note.onset - bar * piece.beatsPerBar;
    const stemUp = note.hand === 'R';
    const y = staffY(note.pitch, note.hand);
    return {
      index,
      note,
      x: STAFF.pad + bar * STAFF.barWidth + 17 + (beat / piece.beatsPerBar) * (STAFF.barWidth - 32),
      y,
      stemUp,
      ledgers: ledgersFor(y, stemUp),
      beamTo: null as number | null,
    };
  });

  /* Beam quavers in pairs, but never across a barline or between hands. */
  for (let i = 0; i < laid.length; i++) {
    const a = laid[i];
    const b = laid[i + 1];
    if (!b || a.note.duration !== 0.5 || b.note.duration !== 0.5) continue;
    if (a.beamTo !== null || laid[i - 1]?.beamTo === i) continue;
    if (barOf(piece, a.note) !== barOf(piece, b.note)) continue;
    if (a.note.hand !== b.note.hand) continue;
    a.beamTo = b.index;
  }

  return laid;
}

export const staffWidth = (piece: Piece) => STAFF.pad + barCount(piece) * STAFF.barWidth + 26;
export const staffHeight = () => STAFF.top + STAFF.height;
