import { ageLabel, possessive, type Child } from '@/features/children/model';
import { skillForGame, type StageNumber } from '@/features/curriculum/skills';
import { GAMES, type GameId } from '@/features/games/catalog';
import { printablesFor } from '@/features/resources/catalog';
import { levelOf, oftenMissed, skillStats, weekSummary } from '@/features/games/engine';
import { Button, buttonVariants } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import type { Progress } from '../model';
import { CheckInPanel, type CheckinScores } from './CheckInPanel';
import { SkillRow } from './SkillRow';

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
    `This week: ${week.rounds} round${week.rounds === 1 ? '' : 's'} on ${week.days} day${week.days === 1 ? '' : 's'} (~${week.minutes} min)`,
    `${progress.stickers.length} sticker${progress.stickers.length === 1 ? '' : 's'}`,
  ].filter(Boolean);

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

        <p className="mt-5 text-sm text-grape/70">
          Accuracy over the last 3 rounds of each game. Two rounds in a row at 80%+ moves a game up a level; two under 50% drops it back. Use − / + to override.
        </p>
        <div className="mt-1">
          {GAMES.map((game) => {
            const level = levelOf(progress.levels, game);
            const stage = (level + 1) as StageNumber;
            const skill = skillForGame(game.id);
            const printable = skill && printablesFor(skill.id).find((p) => p.status === 'ready' && p.link && p.stages.includes(stage));
            return (
              <SkillRow
                key={game.id}
                game={game}
                level={level}
                stats={skillStats(progress.rounds, game.id)}
                missed={oftenMissed(progress.rounds, game.id)}
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
