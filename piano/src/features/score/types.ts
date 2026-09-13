export type Hand = 'L' | 'R';
export type Finger = 1 | 2 | 3 | 4 | 5;

/** One note of a piece. Positions are in beats, never seconds, so the tempo
 *  can be slowed right down without rewriting the score. */
export interface Note {
  /** MIDI note number. Middle C = 60. */
  pitch: number;
  /** Beats from the start of the piece. */
  onset: number;
  /** Length in beats. 0.5 = quaver, 1 = crotchet, 2 = minim. */
  duration: number;
  hand: Hand;
  finger: Finger;
  /** The word under the note in the book. */
  lyric: string;
}

/** Where a hand rests before a note is played. Fingers walk out from the
 *  thumb along the white keys: right hand upward, left hand downward. */
export interface HandPosition {
  thumb: number;
}

export interface Piece {
  id: string;
  title: string;
  source: string;
  tempoBpm: number;
  beatsPerBar: number;
  handPosition: Record<Hand, HandPosition>;
  /** Lowest and highest key to draw on the keyboard. */
  range: { low: number; high: number };
  notes: Note[];
  /** False until a human has checked the transcription against the book. */
  verified: boolean;
}
