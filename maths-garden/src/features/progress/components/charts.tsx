import { cn } from '@/shared/utils/cn';
import type { DayCount, LevelStep, Mastery, Point } from '../history';

/**
 * Small hand-drawn SVG charts. No charting library on purpose: the whole app is a single bundle a parent
 * downloads once on a phone, and these are five shapes.
 */

const AXIS = '#e7a9c1';

export interface LineChartProps {
  points: readonly Point[];
  /** Drawn under the value: "%" or "s". */
  unit: string;
  /** Highest value on the axis; accuracy is always out of 100, speed scales to the data. */
  max?: number;
  /** Lower is better (answer speed), so the good direction flips. */
  lowerIsBetter?: boolean;
  label: string;
  className?: string;
}

/** A week-by-week line with a dot per week, gaps where nothing was played, and the latest value called out. */
export function LineChart({ points, unit, max, lowerIsBetter = false, label, className }: LineChartProps) {
  const values = points.map((p) => p.value).filter((v): v is number => v !== null);
  const top = max ?? Math.max(10, Math.ceil(Math.max(...values, 0) * 1.2));
  const w = 100;
  const h = 46;
  const x = (i: number) => (points.length <= 1 ? w / 2 : (i * w) / (points.length - 1));
  const y = (value: number) => h - (Math.min(value, top) / top) * (h - 6) - 3;

  const segments: string[] = [];
  let current: string[] = [];
  points.forEach((point, i) => {
    if (point.value === null) {
      if (current.length) segments.push(current.join(' '));
      current = [];
      return;
    }
    current.push(`${current.length ? 'L' : 'M'}${x(i)} ${y(point.value)}`);
  });
  if (current.length) segments.push(current.join(' '));

  const latest = [...points].reverse().find((p) => p.value !== null);
  const first = points.find((p) => p.value !== null);
  const change = latest && first && latest !== first ? latest.value! - first.value! : null;
  const good = change === null ? null : lowerIsBetter ? change < 0 : change > 0;

  return (
    <figure className={cn('rounded-[24px] bg-cream p-4 candy-petal [--candy:6px]', className)}>
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-grape">{label}</span>
        <span className="text-sm text-grape/70">
          {latest?.value ?? '—'}
          {latest ? unit : ''}
          {change !== null && (
            <span className={cn('ml-2 font-semibold', good ? 'text-leaf-deep' : 'text-clay')}>
              {change > 0 ? '+' : ''}
              {Math.round(change * 10) / 10}
              {unit}
            </span>
          )}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" preserveAspectRatio="none" role="img" aria-label={`${label}: ${points.map((p) => `${p.label} ${p.value ?? 'none'}${unit}`).join(', ')}`}>
        <line x1={0} y1={h - 3} x2={w} y2={h - 3} stroke={AXIS} strokeWidth={0.4} />
        {segments.map((d) => (
          <path key={d} d={d} fill="none" stroke="#ff7bac" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        ))}
        {points.map((point, i) => point.value !== null && <circle key={point.at} cx={x(i)} cy={y(point.value)} r={1.2} fill="#e0326e" vectorEffect="non-scaling-stroke" />)}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-grape/50">
        <span>{points[0]?.label}</span>
        <span>{points.at(-1)?.label}</span>
      </div>
    </figure>
  );
}

/** Eight weeks of days, darker where more rounds were played: the "are we actually doing it" strip. */
export function ActivityStrip({ days, className }: { days: readonly DayCount[]; className?: string }) {
  const weeks: DayCount[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const shade = (n: number) => (n === 0 ? 'bg-blush' : n === 1 ? 'bg-leaf/40' : n === 2 ? 'bg-leaf/70' : 'bg-leaf');
  const played = days.filter((d) => d.rounds > 0).length;

  return (
    <figure className={cn('rounded-[24px] bg-cream p-4 candy-petal [--candy:6px]', className)}>
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-grape">Days played</span>
        <span className="text-sm text-grape/70">
          {played} of the last {days.length} days
        </span>
      </figcaption>
      <div className="mt-3 flex gap-1" role="img" aria-label={`Played on ${played} of the last ${days.length} days`}>
        {weeks.map((week) => (
          <div key={week[0].date} className="flex flex-1 flex-col gap-1">
            {week.map((day) => (
              <span
                key={day.date}
                title={`${day.date}: ${day.rounds} round${day.rounds === 1 ? '' : 's'}${day.quit ? `, ${day.quit} left early` : ''}`}
                className={cn('block h-3 rounded-[3px]', shade(day.rounds), day.quit > 0 && day.rounds === 0 && 'bg-sunny/70')}
              />
            ))}
          </div>
        ))}
      </div>
    </figure>
  );
}

/** The level a game has sat at over time, as steps; dots mark each change. */
export function LevelLadder({ steps, levels, label, className }: { steps: readonly LevelStep[]; levels: number; label: string; className?: string }) {
  const w = 100;
  const h = 34;
  if (steps.length < 2) return null;
  const start = new Date(steps[0].at).getTime();
  const end = new Date(steps.at(-1)!.at).getTime();
  const span = Math.max(end - start, 1);
  const x = (at: string) => ((new Date(at).getTime() - start) / span) * w;
  const y = (level: number) => h - 4 - (level / Math.max(levels - 1, 1)) * (h - 8);

  const d = steps
    .map((step, i) => (i === 0 ? `M${x(step.at)} ${y(step.level)}` : `L${x(step.at)} ${y(steps[i - 1].level)} L${x(step.at)} ${y(step.level)}`))
    .join(' ');

  return (
    <figure className={cn('rounded-[24px] bg-cream p-4 candy-petal [--candy:6px]', className)}>
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-grape">{label}</span>
        <span className="text-sm text-grape/70">now level {steps.at(-1)!.level + 1}</span>
      </figcaption>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" preserveAspectRatio="none" role="img" aria-label={`${label}: level ${steps.at(-1)!.level + 1} of ${levels}`}>
        {Array.from({ length: levels }, (_, level) => (
          <line key={level} x1={0} y1={y(level)} x2={w} y2={y(level)} stroke={AXIS} strokeWidth={0.3} strokeDasharray="2 2" />
        ))}
        <path d={d} fill="none" stroke="#5fbf8a" strokeWidth={1.6} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {steps.slice(1, -1).map((step) => (
          <circle key={step.at} cx={x(step.at)} cy={y(step.level)} r={1.4} fill="#3d9967" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    </figure>
  );
}

/** Every number asked, coloured by how it goes: the most concrete thing to practise tonight. */
export function MasteryGrid({ items, label, className }: { items: readonly Mastery[]; label: string; className?: string }) {
  if (!items.length) return null;
  const colour = (pct: number) => (pct >= 80 ? 'bg-leaf text-white' : pct >= 50 ? 'bg-sunny' : 'bg-bubble text-white');
  return (
    <figure className={cn('rounded-[24px] bg-cream p-4 candy-petal [--candy:6px]', className)}>
      <figcaption className="font-semibold text-grape">{label}</figcaption>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item.target}
            title={`${item.target}: ${item.right} right, ${item.wrong} wrong`}
            className={cn('flex min-w-9 items-center justify-center gap-1 rounded-xl px-2 py-1 text-sm font-semibold', colour(item.pct))}
          >
            {item.target}
            <span className="text-[11px] font-medium opacity-80">{item.pct}%</span>
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-grape/60">Worst first. Green 80%+, amber 50–79%, pink under 50%.</p>
    </figure>
  );
}

/** One number worth knowing. */
export const StatTile = ({ value, label, hint }: { value: string; label: string; hint?: string }) => (
  <div className="rounded-[20px] bg-blush/70 p-3 text-center">
    <p className="text-2xl font-bold text-raspberry">{value}</p>
    <p className="text-sm font-medium text-grape/80">{label}</p>
    {hint && <p className="text-xs text-grape/55">{hint}</p>}
  </div>
);
