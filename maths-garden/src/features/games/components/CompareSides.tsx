import { cn } from '@/shared/utils/cn';
import type { Side } from '../questions';

export interface CompareSidesProps {
  left: number;
  right: number;
  leftEmoji: string;
  rightEmoji: string;
  answer: Side;
  /** Tapped side; null while waiting. The bigger side then gets a green ring; a wrong pick wobbles. */
  chosen?: Side | null;
  onPick?: (side: Side) => void;
}

export function CompareSides({ left, right, leftEmoji, rightEmoji, answer, chosen = null, onPick }: CompareSidesProps) {
  const sides = [
    { side: 'left', count: left, emoji: leftEmoji },
    { side: 'right', count: right, emoji: rightEmoji },
  ] as const;
  return (
    <div className="flex flex-wrap justify-center gap-[clamp(14px,3vw,30px)]">
      {sides.map(({ side, count, emoji }) => (
        <button
          key={side}
          type="button"
          aria-label={`${count} ${emoji}`}
          onClick={() => chosen === null && onPick?.(side)}
          className={cn(
            'flex min-h-[clamp(180px,30vh,260px)] w-[min(40vw,330px)] flex-wrap content-center items-center justify-center gap-3.5 rounded-[44px] bg-cream p-[clamp(16px,3vw,30px)] candy-petal [--candy:12px] transition-transform active:translate-y-1.5 active:[--candy:6px]',
            chosen !== null && side === answer && 'ring-8 ring-leaf',
            chosen === side && (side === answer ? 'animate-bounce-once' : 'animate-wobble'),
          )}
        >
          {Array.from({ length: count }, (_, i) => (
            <span key={i} className="text-[clamp(30px,5vw,44px)] leading-none">
              {emoji}
            </span>
          ))}
        </button>
      ))}
    </div>
  );
}
