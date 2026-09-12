import { DROP_BELOW, LEVEL_UP_AT, STREAK } from '@/features/games/engine';
import { QUESTIONS_PER_ROUND } from '@/features/games/catalog';
import { DAILY_GOAL } from '@/features/games/insights';
import { cn } from '@/shared/utils/cn';

const UP = Math.round(LEVEL_UP_AT * 100);
const DOWN = Math.round(DROP_BELOW * 100);

const RULES = [
  { icon: '⭐', when: 'A perfect round, answered quickly', then: 'Up a level, straight away', tone: 'up' },
  { icon: '👍', when: `${STREAK} rounds in a row at ${UP}% or better`, then: 'Up a level', tone: 'up' },
  { icon: '🐢', when: `Both of those rounds were slow`, then: 'Stays put, to build speed first', tone: 'hold' },
  { icon: '🌱', when: `${STREAK} rounds in a row under ${DOWN}%`, then: 'Back a level', tone: 'down' },
  { icon: '🤝', when: 'Two misses in a row inside a round', then: 'The next question comes from the level below', tone: 'hold' },
] as const;

const TONE = {
  up: 'bg-leaf/15 border-leaf',
  hold: 'bg-sunny/20 border-sunny',
  down: 'bg-bubble/15 border-bubble',
} as const;

const Step = ({ n, title, text }: { n: string; title: string; text: string }) => (
  <li className="flex-1 rounded-[22px] bg-cream p-4 candy-petal [--candy:6px]">
    <span className="text-2xl">{n}</span>
    <h4 className="mt-1 font-semibold text-raspberry">{title}</h4>
    <p className="text-sm text-grape/80">{text}</p>
  </li>
);

/**
 * How a round turns into a level: what is measured, the rules that move a child up or down, and what a
 * level change unlocks on paper. Shown on the progress screen and in the guide, because the honest answer
 * to "how does it know?" is five rules a parent can read in a minute.
 */
export function ScoringDiagram({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <ol className="flex flex-col gap-3 sm:flex-row">
        <Step n="🎲" title={`${QUESTIONS_PER_ROUND} questions`} text="One round. Each answer is marked right or wrong, and timed from the moment the answer buttons appear." />
        <Step n="📊" title="Two measurements" text="Accuracy for the round, and the median answer time against what is reasonable for that question." />
        <Step n="⚖️" title="The rules below" text="Applied to the last two rounds at the current level." />
        <Step n="🖨" title="Stage and sheets" text="Levels 1–3 are printable stages 1–3. Crossing into a new stage emails you the report and the next sheets." />
      </ol>

      <ul className="flex flex-col gap-2">
        {RULES.map((rule) => (
          <li key={rule.when} className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border-2 px-4 py-2.5', TONE[rule.tone])}>
            <span className="text-xl">{rule.icon}</span>
            <span className="min-w-[220px] flex-1 font-medium text-grape">{rule.when}</span>
            <span className="font-semibold text-grape/90">→ {rule.then}</span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-grape/70">
        Rounds left part-way through are saved but never change a level — they say more about tiredness than about maths. The daily goal is {DAILY_GOAL} rounds,
        and a break is suggested when a child plays a lot, quits twice or suddenly slows down.
      </p>
    </div>
  );
}
