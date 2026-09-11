import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';

export interface AnswerRowProps {
  options: readonly number[];
  answer: number;
  /** What was tapped; null while waiting. Once set, the right answer turns green and a wrong pick wobbles. */
  chosen?: number | null;
  onPick?: (n: number) => void;
  className?: string;
}

export const AnswerRow = ({ options, answer, chosen = null, onPick, className }: AnswerRowProps) => (
  <div className={cn('flex flex-wrap justify-center gap-[clamp(14px,3vw,26px)]', className)}>
    {options.map((n) => (
      <Button
        key={n}
        size="answer"
        variant={chosen === null ? 'answer' : n === answer ? 'right' : n === chosen ? 'wrong' : 'answer'}
        onClick={() => chosen === null && onPick?.(n)}
      >
        {n}
      </Button>
    ))}
  </div>
);
