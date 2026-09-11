import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { between, shuffle, type Rng } from '../questions';

export interface GrownUpsGateProps {
  onPass: () => void;
  onCancel: () => void;
  rng?: Rng;
}

/** "Grown-ups only — What is 7 + 5?" with three round answers; a wrong tap goes back home. Sums a four-year-old can't do yet. */
export function GrownUpsGate({ onPass, onCancel, rng = Math.random }: GrownUpsGateProps) {
  const [sum] = useState(() => {
    const a = between(rng, 3, 8);
    const b = between(rng, 3, 8);
    return { a, b, options: shuffle(rng, [a + b, a + b + 1, a + b - 2]) };
  });
  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center px-6">
      <Card className="w-full max-w-[420px] text-center">
        <h2 className="text-3xl font-semibold text-raspberry">Grown-ups only</h2>
        <p className="mt-1 text-lg text-grape/70">
          What is{' '}
          <b>
            {sum.a} + {sum.b}
          </b>
          ?
        </p>
        <div className="mt-6 flex justify-center gap-4">
          {sum.options.map((n) => (
            <Button key={n} variant="answer" size="answer" className="size-[84px] text-4xl" onClick={() => (n === sum.a + sum.b ? onPass() : onCancel())}>
              {n}
            </Button>
          ))}
        </div>
        <Button variant="quiet" size="md" className="mt-8" onClick={onCancel}>
          Back
        </Button>
      </Card>
    </div>
  );
}
