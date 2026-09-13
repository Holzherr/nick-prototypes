import { FINGER_NAMES } from '@/features/score/music.ts';
import type { Finger, Hand } from '@/features/score/types.ts';
import { FingerFan } from './FingerFan.tsx';

export interface HandPanelProps {
  hand: Hand;
  position: Record<Finger, number>;
  used: Partial<Record<Finger, string>>;
  /** The finger playing right now, if this hand has it. */
  playing?: Finger | null;
  /** The finger this hand takes over with on the very next note. */
  preparing?: Finger | null;
}

/** Both hands stay on screen at all times. The tune passes between them almost
 *  every note, and a panel that appears and disappears announces the swap too
 *  late - so the waiting hand is dimmed, not hidden, and flags what is coming. */
export function HandPanel({ hand, position, used, playing = null, preparing = null }: HandPanelProps) {
  const active = playing !== null;
  const upnext = !active && preparing !== null;
  const name = hand === 'R' ? 'Right hand' : 'Left hand';

  return (
    <div
      className={`hand${active ? ' active' : ''}${upnext ? ' upnext' : ''}`}
      style={{ ['--c' as string]: hand === 'R' ? 'var(--rh)' : 'var(--lh)' }}
    >
      <div className="hlabel">
        {name}
        <span className="pill">next</span>
      </div>
      <FingerFan hand={hand} position={position} used={used} playing={playing} preparing={preparing} />
      <div className="fingerword">
        {active ? FINGER_NAMES[playing] : upnext ? 'gets ready' : ''}
      </div>
      <div className="anchor">thumb on middle C</div>
    </div>
  );
}
