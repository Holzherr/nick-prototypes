import { letterOf } from '@/features/score/music.ts';
import type { Finger, Hand } from '@/features/score/types.ts';

export interface FingerFanProps {
  hand: Hand;
  /** Where each finger rests. */
  position: Record<Finger, number>;
  /** Letters this piece actually asks of each finger. */
  used: Partial<Record<Finger, string>>;
  playing?: Finger | null;
  preparing?: Finger | null;
}

const ARC = [30, 12, 2, 12, 26];

/** Five fingertips in an arc. Thumbs face each other, so finger 1 is on the
 *  left for the right hand and on the right for the left hand - the shape she
 *  sees matches the hand she is looking at. */
export function FingerFan({ hand, position, used, playing, preparing }: FingerFanProps) {
  return (
    <svg className="fan" viewBox="0 0 210 100" aria-hidden="true">
      {[0, 1, 2, 3, 4].map(slot => {
        const finger = (hand === 'R' ? slot + 1 : 5 - slot) as Finger;
        const cx = 25 + slot * 40;
        const cy = 22 + ARC[slot];
        const state = finger === playing ? 'on' : finger === preparing ? 'nx' : '';
        const unused = used[finger] ? '' : ' unused';
        return (
          <g key={finger} className={`${state}${unused}`}>
            <circle cx={cx} cy={cy} r={15} />
            <text className="num" x={cx} y={cy}>{finger}</text>
            <text className="ltr" x={cx} y={cy + 30}>{letterOf(position[finger])}</text>
          </g>
        );
      })}
    </svg>
  );
}
