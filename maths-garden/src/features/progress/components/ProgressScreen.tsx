import { possessive, type Child } from '@/features/children/model';
import { skillForGame } from '@/features/curriculum/skills';
import { GAMES, gameById } from '@/features/games/catalog';
import { levelOf } from '@/features/games/engine';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { activityByDay, historySummary, levelChanges, levelTimeline, masteryByTarget, weeklyAccuracy, weeklySpeed } from '../history';
import type { LevelReason, Progress } from '../model';
import { ActivityStrip, LevelLadder, LineChart, MasteryGrid, StatTile } from './charts';
import { ScoringDiagram } from './ScoringDiagram';

const REASON: Record<LevelReason, { label: string; icon: string }> = {
  earned: { label: 'earned it', icon: '⬆️' },
  dropped: { label: 'dropped back', icon: '⬇️' },
  manual: { label: 'you changed it', icon: '✋' },
  import: { label: 'brought in from guest mode', icon: '📥' },
};

const when = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export interface ProgressScreenProps {
  child: Child;
  progress: Progress;
  now?: Date;
  onClose: () => void;
}

/**
 * Progress over time: the totals, accuracy and speed by week, which days were played, then per game the
 * level ladder and which numbers are shaky — and, at the end, exactly how a round turns into a level.
 */
export function ProgressScreen({ child, progress, now = new Date(), onClose }: ProgressScreenProps) {
  const summary = historySummary(progress, GAMES);
  const changes = levelChanges(progress, GAMES).slice(0, 12);
  const played = GAMES.filter((game) => progress.rounds.some((r) => r.game === game.id));

  return (
    <div className="relative z-10 flex min-h-dvh justify-center px-4 pb-10 pt-[max(24px,env(safe-area-inset-top))] print:p-0">
      <Card className="w-full max-w-[860px] p-[clamp(20px,4vw,34px)] print:rounded-none print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-bubble">Progress over time</p>
            <h2 className="text-3xl font-semibold text-raspberry">
              {child.avatar} {possessive(child.name)} history
            </h2>
            <p className="mt-1 text-sm text-grape/70">
              {summary.firstPlayed ? `Playing since ${when(summary.firstPlayed)}` : 'No rounds played yet'}
              {summary.lastPlayed ? ` · last played ${when(summary.lastPlayed)}` : ''}
            </p>
          </div>
          <Button variant="quiet" size="sm" className="print:hidden" onClick={onClose}>
            Close
          </Button>
        </header>

        {summary.rounds === 0 ? (
          <p className="mt-8 rounded-[24px] bg-blush p-5 text-grape/80">
            Nothing to chart yet. Play a few rounds and this fills in: accuracy and speed by week, which days you played, how the levels moved and which numbers
            keep catching her out.
          </p>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile value={String(summary.rounds)} label="rounds" />
              <StatTile value={String(summary.questions)} label="questions" />
              <StatTile value={String(summary.days)} label="days played" />
              <StatTile value={String(summary.bestStreak)} label="best run" hint="days in a row" />
              <StatTile value={`${summary.minutes}m`} label="answering" hint="all time" />
              <StatTile value={`${summary.movesUp}↑ ${summary.movesDown}↓`} label="level moves" />
            </div>

            {summary.firstTen !== null && summary.lastTen !== null && summary.rounds >= 12 && (
              <p className="mt-4 rounded-[24px] bg-leaf/15 p-4 text-grape/85">
                <b>Then and now.</b> First ten rounds: {summary.firstTen}% correct. Most recent ten: {summary.lastTen}%
                {summary.lastTen > summary.firstTen ? ' — and the questions have got harder along the way.' : '. The levels have moved on, so the questions are harder than they were.'}
              </p>
            )}

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <LineChart points={weeklyAccuracy(progress.rounds, null, 8, now)} unit="%" max={100} label="Accuracy by week" />
              <LineChart points={weeklySpeed(progress.rounds, null, 8, now)} unit="s" lowerIsBetter label="Seconds per answer" />
            </div>
            <ActivityStrip className="mt-3" days={activityByDay(progress.rounds, 56, now)} />

            <h3 className="mt-8 text-2xl font-semibold text-raspberry">Skill by skill</h3>
            <div className="mt-2 flex flex-col gap-3">
              {played.map((game) => {
                const steps = levelTimeline(progress, game, now);
                const mastery = masteryByTarget(progress.rounds, game.id).slice(0, 14);
                return (
                  <details key={game.id} className="rounded-[24px] bg-blush/60 p-4">
                    <summary className="cursor-pointer list-none font-semibold text-grape marker:hidden">
                      {game.emoji} {game.skill} — level {levelOf(progress.levels, game) + 1} of {game.levels.length}
                      <span className="ml-2 text-sm font-medium text-grape/60">({skillForGame(game.id)?.stages[Math.min(levelOf(progress.levels, game), 2)].age} typically)</span>
                    </summary>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {steps.length > 1 && <LevelLadder steps={steps} levels={game.levels.length} label="Level over time" />}
                      <LineChart points={weeklyAccuracy(progress.rounds, game.id, 8, now)} unit="%" max={100} label="Accuracy by week" />
                      {mastery.length > 0 && <MasteryGrid className="md:col-span-2" items={mastery} label="Every number asked" />}
                    </div>
                  </details>
                );
              })}
            </div>

            {changes.length > 0 && (
              <>
                <h3 className="mt-8 text-2xl font-semibold text-raspberry">Every level move</h3>
                <ul className="mt-2 flex flex-col gap-1.5 text-sm text-grape/85">
                  {changes.map((change) => (
                    <li key={change.id}>
                      {REASON[change.reason].icon} <b>{gameById(change.game).name}</b> level {change.from + 1} → {change.to + 1}{' '}
                      <span className="text-grape/55">
                        {when(change.at)} · {REASON[change.reason].label}
                      </span>
                    </li>
                  ))}
                </ul>
                {progress.levelEvents.length === 0 && (
                  <p className="mt-2 text-xs text-grape/55">Worked out from the rounds either side, because these moves happened before the app started recording them.</p>
                )}
              </>
            )}
          </>
        )}

        <h3 className="mt-8 text-2xl font-semibold text-raspberry">How the levels move</h3>
        <p className="mt-1 text-sm text-grape/70">Every round is marked on two things, and five rules decide what happens next.</p>
        <ScoringDiagram className="mt-3" />

        <footer className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
          <Button onClick={() => window.print()}>🖨 Print this</Button>
          <Button variant="quiet" onClick={onClose}>
            Close
          </Button>
        </footer>
      </Card>
    </div>
  );
}
