import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { between, shuffle, type Rng } from '../questions';

export interface GrownUpsGateProps {
  onPass: () => void;
  onCancel: () => void;
  rng?: Rng;
}

const WINDOW = 10 * 60_000;
const PASSED_KEY = 'maths-garden:grown-ups-passed';

/**
 * When the sum was last answered. Kept in sessionStorage rather than a module variable: module state dies
 * with the document, so reloading the grown-ups screen asked for the sum again — the screen survived the
 * refresh but the pass did not. sessionStorage survives a reload, is private to the tab, and is dropped when
 * the tab closes, so a child opening the app fresh still meets the gate.
 *
 * Both ends swallow errors on purpose. Safari throws on storage access in private mode, and a gate that
 * throws would take the whole grown-ups screen down; failing closed just means asking the sum again.
 */
const readPassedAt = (): number => {
  try {
    return Number(sessionStorage.getItem(PASSED_KEY)) || 0;
  } catch {
    return 0;
  }
};

const writePassedAt = (at: number) => {
  try {
    sessionStorage.setItem(PASSED_KEY, String(at));
  } catch {
    // Best effort: the gate simply asks again.
  }
};

/** Whether the sum was answered recently enough to skip — across a reload, for ten minutes. */
export const grownUpsPassed = () => Date.now() - readPassedAt() < WINDOW;

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
            <Button
              key={n}
              variant="answer"
              size="answer"
              className="size-[84px] text-4xl"
              onClick={() => {
                if (n !== sum.a + sum.b) return onCancel();
                writePassedAt(Date.now());
                onPass();
              }}
            >
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
