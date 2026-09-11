import { cn } from '@/shared/utils/cn';

/** One star per question; a star lights up (full colour, tilted, larger) when that question was right. */
export const StarRow = ({ results, total }: { results: readonly boolean[]; total: number }) => (
  <div role="img" aria-label={`${results.filter(Boolean).length} of ${total} stars`} className="flex gap-2 text-[clamp(24px,4vw,30px)]">
    {Array.from({ length: total }, (_, i) => (
      <span key={i} className={cn('transition duration-300', results[i] ? 'scale-125 -rotate-8 opacity-100' : 'opacity-25')}>
        ⭐
      </span>
    ))}
  </div>
);
