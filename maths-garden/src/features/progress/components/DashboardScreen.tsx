import { ageLabel, possessive, type Child } from '@/features/children/model';
import { skillForGame, type StageNumber } from '@/features/curriculum/skills';
import { GAMES, type GameId } from '@/features/games/catalog';
import { printablesFor } from '@/features/resources/catalog';
import { levelOf, oftenMissed, skillStats, weekSummary } from '@/features/games/engine';
import { coachingNotes, countingHabit, daysPlayed, levelHistory, replayHabit, speedTrend, todaySummary } from '@/features/games/insights';
import { Button, buttonVariants } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import type { Progress } from '../model';
import { CheckInPanel, type CheckinScores } from './CheckInPanel';
import { MotivationPanel } from './MotivationPanel';
import { SkillRow } from './SkillRow';

function habitFor(game: GameId, progress: Progress): string | null {
  if (game === 'count') {
    const h = countingHabit(progress.rounds);
    return h ? `touch-counts every object ${h.countedAllPct}% of the time, ${h.tapsPerQuestion} taps per question` : null;
  }
  if (game === 'find') {
    const h = replayHabit(progress.rounds);
    return h ? `"Hear it again" ${h.perQuestion}× per question` : null;
  }
  return null;
}

export interface DashboardScreenProps {
  child: Child;
  progress: Progress;
  /** Changes still waiting to upload. */
  pending: number;
  now?: Date;
  onSetLevel: (game: GameId, level: number) => void;
  onAddCheckin: (scores: CheckinScores, note: string) => void;
  onSwitchChild: () => void;
  onSignOut: () => void;
  onClose: () => void;
}

/**
 * Grown-ups screen on one cream card: "Tara's progress" with age, this week's rounds/days/minutes and
 * sticker count; the levelling rule; a SkillRow per game; the weekly check-in; then switch child / sign out.
 */
export function DashboardScreen({ child, progress, pending, now = new Date(), onSetLevel, onAddCheckin, onSwitchChild, onSignOut, onClose }: DashboardScreenProps) {
  const week = weekSummary(progress.rounds, now);
  const age = ageLabel(child.birthdate, now);
  const summary = [
    age,
    `This week: ${week.rounds} round${week.rounds === 1 ? '' : 's'} on ${week.days} day${week.days === 1 ? '' : 's'} (~${week.minutes} min)${week.quit ? `, ${week.quit} left early` : ''}`,
    `${progress.stickers.length} sticker${progress.stickers.length === 1 ? '' : 's'}`,
  ].filter(Boolean);

  const shiftAll = (by: 1 | -1) => {
    for (const game of GAMES) {
      const level = levelOf(progress.levels, game);
      const next = Math.min(Math.max(level + by, 0), game.levels.length - 1);
      if (next !== level) onSetLevel(game.id, next);
    }
  };

  return (
    <div className="relative z-10 flex min-h-dvh justify-center px-4 pb-10 pt-[max(24px,env(safe-area-inset-top))]">
      <Card className="w-full max-w-[760px] p-[clamp(20px,4vw,34px)]">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold text-raspberry">
              {child.avatar} {possessive(child.name)} progress
            </h2>
            <p className="mt-1 text-sm text-grape/70">{summary.join(' · ')}</p>
          </div>
          <Button variant="quiet" size="sm" onClick={onClose}>
            Close
          </Button>
        </header>

        <MotivationPanel
          today={todaySummary(progress.rounds, now)}
          daysThisWeek={daysPlayed(progress.rounds, now)}
          notes={coachingNotes(progress.rounds, GAMES, now)}
          moves={levelHistory(progress.rounds, GAMES).map((m) => ({ ...m, name: GAMES.find((g) => g.id === m.game)?.name ?? m.game }))}
        />

        <p className="mt-6 text-sm text-grape/70">
          Accuracy and answer speed over the last 3 rounds of each game. A quick perfect round, or two in a row at 80%+, moves a game up a level; if both
          were slow it stays to build speed. Two under 50% drops it back, and after two misses in a row the next question comes from the level below.
          Levels 4 and 5 are challenge levels. Use − / + to override.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => shiftAll(1)}>
            Make all games harder
          </Button>
          <Button variant="quiet" size="sm" onClick={() => shiftAll(-1)}>
            Easier
          </Button>
        </div>
        <div className="mt-1">
          {GAMES.map((game) => {
            const level = levelOf(progress.levels, game);
            const stage = Math.min(level + 1, 3) as StageNumber;
            const skill = skillForGame(game.id);
            const printable = skill && printablesFor(skill.id).find((p) => p.status === 'ready' && p.link && p.stages.includes(stage));
            return (
              <SkillRow
                key={game.id}
                game={game}
                level={level}
                stats={skillStats(progress.rounds, game.id)}
                missed={oftenMissed(progress.rounds, game.id)}
                speed={speedTrend(progress.rounds, game.id)}
                habit={habitFor(game.id, progress)}
                onSetLevel={(next) => onSetLevel(game.id, next)}
                print={printable?.link ? { href: printable.link(stage, child.name), label: `Print stage ${stage} ${printable.title.toLowerCase()}` } : undefined}
              />
            );
          })}
        </div>

        <CheckInPanel checkins={progress.checkins} onSubmit={onAddCheckin} />

        {pending > 0 && (
          <p className="mt-6 rounded-2xl bg-blush px-4 py-3 text-sm text-clay">
            {pending} change{pending === 1 ? '' : 's'} saved on this iPad, waiting to upload. They sync when it is back online.
          </p>
        )}

        <footer className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#/resources" className={buttonVariants({ variant: 'quiet' })}>
            🖨 Free printables
          </a>
          <Button variant="quiet" onClick={onSwitchChild}>
            Switch or add child
          </Button>
          <Button variant="ghost" onClick={onSignOut}>
            Sign out
          </Button>
        </footer>
      </Card>
    </div>
  );
}
