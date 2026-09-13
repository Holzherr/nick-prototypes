import { isWhite, letterOf, octaveOf, positionMap } from '@/features/score/music.ts';
import type { Finger, Hand, Piece } from '@/features/score/types.ts';

export interface KeyboardProps {
  piece: Piece;
  /** The key she should play now. */
  target: number;
  /** The key after it, outlined so the hand can get ready. */
  next?: number;
  /** Hide the letter names once she no longer needs them. */
  showLetters?: boolean;
  onPress: (pitch: number) => void;
}

interface Badge { hand: Hand; finger: Finger }

/** Finger numbers resting on the keys they start on. Both thumbs land on
 *  middle C, so that key carries one badge from each hand - which is the
 *  single most important thing to see before playing. */
function restingBadges(piece: Piece): Map<number, Badge[]> {
  const map = new Map<number, Badge[]>();
  for (const hand of ['L', 'R'] as Hand[]) {
    const position = positionMap(piece, hand);
    for (const finger of [1, 2, 3, 4, 5] as Finger[]) {
      const pitch = position[finger];
      const list = map.get(pitch) ?? [];
      list.push({ hand, finger });
      map.set(pitch, list);
    }
  }
  for (const list of map.values()) list.sort(a => (a.hand === 'L' ? -1 : 1));
  return map;
}

export function Keyboard({ piece, target, next, showLetters = true, onPress }: KeyboardProps) {
  const { low, high } = piece.range;
  const pitches = Array.from({ length: high - low + 1 }, (_, i) => low + i);
  const whites = pitches.filter(isWhite);
  const badges = restingBadges(piece);

  const badgesFor = (pitch: number) => {
    const list = badges.get(pitch);
    if (!list) return null;
    return (
      <span className="badges">
        {list.map(b => (
          <span key={`${b.hand}${b.finger}`} className={`fbadge ${b.hand}`}>
            {b.finger}
          </span>
        ))}
      </span>
    );
  };

  const cls = (pitch: number, base: string) =>
    [base, pitch === target && 'target', pitch === next && pitch !== target && 'nextkey']
      .filter(Boolean)
      .join(' ');

  return (
    <div className="kbwrap">
      <div
        className={`kb${showLetters ? '' : ' nolabels'}`}
        style={{ gridTemplateColumns: `repeat(${whites.length}, 1fr)` }}
      >
        {whites.map(pitch => (
          <button
            key={pitch}
            type="button"
            className={cls(pitch, 'wk')}
            aria-label={`${letterOf(pitch)} ${octaveOf(pitch)}`}
            onClick={() => onPress(pitch)}
          >
            <span className="lbl">{letterOf(pitch)}</span>
            {pitch === 60 && <span className="mc" />}
            {badgesFor(pitch)}
          </button>
        ))}

        {pitches.filter(p => !isWhite(p)).map(pitch => {
          const leftOf = whites.filter(w => w < pitch).length;
          return (
            <button
              key={pitch}
              type="button"
              className={cls(pitch, 'bk')}
              aria-label={`${letterOf(pitch)} ${octaveOf(pitch)}`}
              style={{ left: `calc(10px + (100% - 20px) * ${leftOf / whites.length})` }}
              onClick={() => onPress(pitch)}
            />
          );
        })}
      </div>
    </div>
  );
}
