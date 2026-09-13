import { barOf, letterOf } from '@/features/score/music.ts';
import type { Piece } from '@/features/score/types.ts';

export interface NoteStripProps {
  piece: Piece;
  current: number;
  played: boolean[];
  onSelect: (index: number) => void;
}

/** Every note of the piece as a row of chips: progress and a way to jump. */
export function NoteStrip({ piece, current, played, onSelect }: NoteStripProps) {
  let bar = -1;
  return (
    <div className="strip">
      {piece.notes.map((n, i) => {
        const b = barOf(piece, n);
        const label = b !== bar ? <span key={`b${b}`} className="barlabel">{b + 1}</span> : null;
        bar = b;
        return (
          <span key={i} style={{ display: 'contents' }}>
            {label}
            <button
              type="button"
              className={[
                'chip',
                n.hand === 'R' ? 'rh' : 'lh',
                i === current ? 'cur' : '',
                played[i] && i !== current ? 'done' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelect(i)}
            >
              <span className="n">{letterOf(n.pitch)}</span>
              <span className="w">{n.lyric}</span>
            </button>
          </span>
        );
      })}
    </div>
  );
}
