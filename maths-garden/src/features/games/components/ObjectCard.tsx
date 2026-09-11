import { cn } from '@/shared/utils/cn';

export interface ObjectCardProps {
  emoji: string;
  count: number;
  /** Indexes already tapped; they grow so each one is only counted once. No numbers are shown (that would give the answer away). */
  counted?: readonly number[];
  /** Items from this index on pop in as they appear. */
  popFrom?: number;
  /** Makes each object tappable. */
  onTap?: (index: number) => void;
  className?: string;
}

export const ObjectCard = ({ emoji, count, counted = [], popFrom, onTap, className }: ObjectCardProps) => (
  <div
    className={cn(
      'flex min-h-[120px] max-w-[640px] flex-wrap items-center justify-center gap-5 rounded-[44px] bg-cream px-[clamp(20px,5vw,44px)] py-9 candy-petal [--candy:12px]',
      className,
    )}
  >
    {Array.from({ length: count }, (_, i) => {
      const cls = cn(
        'text-[clamp(40px,7vw,54px)] leading-none transition-transform duration-150',
        counted.includes(i) && 'scale-[1.28] drop-shadow-[0_0_10px_rgba(255,123,172,0.9)]',
        popFrom !== undefined && i >= popFrom && 'animate-pop-in',
      );
      return onTap ? (
        <button key={i} type="button" className={cls} aria-label={`${emoji} ${i + 1}`} onClick={() => onTap(i)}>
          {emoji}
        </button>
      ) : (
        <span key={i} className={cls}>
          {emoji}
        </span>
      );
    })}
  </div>
);
