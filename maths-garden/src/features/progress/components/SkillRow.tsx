import type { Game } from '@/features/games/catalog';
import { advice, type SkillStats } from '@/features/games/engine';
import type { SpeedTrend } from '@/features/games/insights';
import { Button } from '@/shared/components/ui/button';

export interface SkillRowProps {
  game: Game;
  level: number;
  stats: SkillStats | null;
  missed: readonly { target: string; count: number }[];
  onSetLevel: (level: number) => void;
  /** Answer speed over the last rounds. */
  speed?: SpeedTrend | null;
  /** A habit worth knowing ("touch-counts every object 80% of the time"). */
  habit?: string | null;
  /** Printables for the current stage, when there are any. */
  print?: { href: string; label: string };
}

const PACE_LABEL = { fluent: 'quick', steady: 'steady', slow: 'slow' } as const;

/**
 * One game on the progress screen: skill name, pink accuracy bar with %, − Lv n + stepper; below, the advice
 * line, range, answer speed with its trend, habits, "Often missed" and the print link.
 */
export const SkillRow = ({ game, level, stats, missed, onSetLevel, speed, habit, print }: SkillRowProps) => (
  <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b-2 border-dashed border-petal py-3.5">
    <div className="min-w-[150px] flex-1 text-lg font-semibold">
      {game.emoji} {game.skill}
    </div>
    <div className="h-5 min-w-[110px] flex-[2] overflow-hidden rounded-full bg-blush">
      <i className="block h-full rounded-full bg-bubble transition-[width]" style={{ width: `${stats?.pct ?? 0}%` }} />
    </div>
    <div className="w-14 text-right font-bold">{stats ? `${stats.pct}%` : '—'}</div>
    <div className="flex items-center gap-2">
      <Button variant="quiet" size="icon" className="size-[38px] text-xl [--candy:4px]" aria-label={`Lower ${game.name} level`} disabled={level === 0} onClick={() => onSetLevel(level - 1)}>
        −
      </Button>
      <span className="w-11 text-center text-sm font-semibold">Lv {level + 1}</span>
      <Button
        variant="quiet"
        size="icon"
        className="size-[38px] text-xl [--candy:4px]"
        aria-label={`Raise ${game.name} level`}
        disabled={level === game.levels.length - 1}
        onClick={() => onSetLevel(level + 1)}
      >
        +
      </Button>
    </div>
    <p className="w-full text-sm text-grape/80">
      {advice(stats, level, game, speed?.pace)}{' '}
      <span className="text-grape/55">
        Numbers up to {game.levels[level].max} · {stats?.rounds ?? 0} round{stats?.rounds === 1 ? '' : 's'} counted
      </span>
      {speed?.ms != null && (
        <>
          {' · '}⏱ ~{(speed.ms / 1000).toFixed(1)}s per answer{speed.pace ? ` (${PACE_LABEL[speed.pace]}` : ''}
          {speed.change && speed.change !== 'steady' ? `, ${speed.change} than before` : ''}
          {speed.pace ? ')' : ''}
        </>
      )}
      {habit && <> · {habit}</>}
      {missed.length > 0 && (
        <>
          {' · '}
          <b className="text-raspberry">Often missed:</b> {missed.map((m) => `${m.target} (${m.count}×)`).join(', ')}
        </>
      )}
      {print && (
        <>
          {' · '}
          <a href={print.href} className="font-semibold text-raspberry underline">
            🖨 {print.label}
          </a>
        </>
      )}
    </p>
  </div>
);
