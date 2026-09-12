import { cn } from '@/shared/utils/cn';

export interface FrameCardProps {
  /** How many boxes the frame has: 5 is one row, 10 is two. */
  capacity: 5 | 10;
  /** How many are filled, from the top left. */
  filled: number;
  /** Empty boxes show a question mark rather than sitting blank. */
  asking?: boolean;
  /** What fills a box. */
  emoji?: string;
  className?: string;
}

/**
 * A five or ten frame. The frame is the point: filling it left to right, top row first, is what makes
 * "three and two make five" visible rather than something to be counted out every time.
 */
export function FrameCard({ capacity, filled, asking = false, emoji = '🔴', className }: FrameCardProps) {
  const columns = 5;
  const rows = capacity / columns;
  return (
    <div
      role="img"
      aria-label={`${filled} of ${capacity} boxes filled`}
      className={cn('grid gap-[4px] rounded-[22px] bg-cream p-[10px] candy-petal [--candy:7px]', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
    >
      {Array.from({ length: capacity }, (_, i) => (
        <span
          key={i}
          className={cn(
            'flex size-[clamp(44px,9vw,72px)] items-center justify-center rounded-2xl border-[3px] text-[clamp(26px,5vw,44px)] leading-none',
            i < filled ? 'border-bubble bg-petal/60' : 'border-dashed border-petal bg-white',
          )}
        >
          {i < filled ? emoji : asking ? <span className="text-[clamp(20px,3.6vw,32px)] font-bold text-bubble/60">?</span> : ''}
        </span>
      ))}
    </div>
  );
}
