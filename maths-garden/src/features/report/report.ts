import { SKILLS, type Skill, type SkillId, type StageNumber } from '@/features/curriculum/skills';
import { GAMES, gameById, type Game } from '@/features/games/catalog';
import { levelOf, oftenMissed, skillStats, weekSummary } from '@/features/games/engine';
import { coachingNotes, daysPlayed, speedTrend } from '@/features/games/insights';
import type { Progress } from '@/features/progress/model';
import { printablesFor, type Printable } from '@/features/resources/catalog';

/**
 * The tutor report: what the round log says about a child, in a parent's language, with the printables
 * that would help most next. It drives the grown-ups report screen and the stage-up email, so it is a pure
 * function of the progress — no wording lives in the UI.
 */

export type Verdict = 'strength' | 'steady' | 'focus' | 'new';

/** Game level n is printable stage n + 1, capped at the last paper stage. */
export const stageOf = (level: number): StageNumber => Math.min(level + 1, 3) as StageNumber;

export interface SkillReport {
  skill: Skill;
  game: Game | null;
  level: number;
  stage: StageNumber;
  /** Accuracy over the last rounds, or null when the game has never been played. */
  pct: number | null;
  rounds: number;
  pace: 'fluent' | 'steady' | 'slow' | null;
  missed: readonly { target: string; count: number }[];
  verdict: Verdict;
  /** One line for the parent. */
  note: string;
}

export interface Recommendation {
  printable: Printable;
  stage: StageNumber;
  href: string;
  /** Why this sheet, for this child, now. */
  why: string;
}

export interface TutorReport {
  childName: string;
  generatedAt: string;
  /** The stage most of the work is at now. */
  stage: StageNumber;
  headline: string;
  week: { rounds: number; quit: number; days: number; minutes: number };
  daysThisWeek: number;
  skills: SkillReport[];
  strengths: SkillReport[];
  focus: SkillReport[];
  recommended: Recommendation[];
  /** Things to do away from the screen, weakest skill first. */
  practice: string[];
  /** Warning signs worth a parent's attention. */
  notes: string[];
}

/** One concrete off-screen activity per skill — the part that matters most at this age. */
const PRACTICE: Record<SkillId, string> = {
  subitising: 'Flash three grapes in your hand for a second, hide them: “How many?” Then ask how she saw it.',
  counting: 'Count the stairs, or forks on the table, touching each one. Ask “so how many altogether?” at the end.',
  numerals: 'Spot numbers on front doors, buses and lift buttons and say them together.',
  comparison: 'Two piles of raisins: “who has more?” Then make them the same.',
  adding: 'Three toys, then one more arrives: “how many now?” Nudge her to count on instead of starting again.',
  rote: 'Count to 20 going up the stairs, then count back from 10 like a rocket launch.',
};

const PACE_WORD = { fluent: 'quick', steady: 'steady', slow: 'slow' } as const;

function verdictOf(pct: number | null, rounds: number, pace: SkillReport['pace']): Verdict {
  if (pct === null || rounds === 0) return 'new';
  if (pct >= 85 && pace !== 'slow') return 'strength';
  if (pct < 60) return 'focus';
  return 'steady';
}

function noteFor(report: Omit<SkillReport, 'note'>): string {
  const { game, pct, rounds, pace, missed, stage, level, verdict } = report;
  if (verdict === 'new') return game ? `Not played yet. Start at stage 1: print the sheet and play a round together.` : 'Checked by you, not by a game — see the weekly check-in.';
  const missedBit = missed.length ? ` Trips up on ${missed.map((m) => m.target).join(', ')}.` : '';
  const speedBit = pace ? `, ${PACE_WORD[pace]} answers` : '';
  const base = `${pct}% over the last ${rounds} round${rounds === 1 ? '' : 's'} at stage ${stage}${speedBit}.`;
  if (verdict === 'strength') {
    const top = game && level >= game.levels.length - 1;
    return `${base} ${top ? 'Top level — stretch her with real objects and bigger numbers.' : 'Ready to move up: print the next stage.'}${missedBit}`;
  }
  if (verdict === 'focus') return `${base} Needs the most work.${missedBit} Practise on paper before more screen rounds.`;
  return `${base} Nearly there — a couple more rounds should move her up.${missedBit}`;
}

const WHY: Record<Verdict, (skill: string) => string> = {
  focus: (skill) => `${skill} is the weakest right now — this is the one to print first.`,
  new: (skill) => `${skill} hasn't been started yet; the sheet is the gentle way in.`,
  steady: (skill) => `${skill} is close to moving up; a few rounds on paper will get her there.`,
  strength: (skill) => `${skill} is strong — this is the next stage up.`,
};

/** The sheet to print for a skill, at the stage the child is on (or the next one when they are flying). */
function recommend(report: SkillReport, childName: string): Recommendation | null {
  const stage = report.verdict === 'strength' ? (Math.min(report.stage + 1, 3) as StageNumber) : report.stage;
  const printable = printablesFor(report.skill.id).find((p) => p.status === 'ready' && p.link && p.stages.includes(stage));
  if (!printable?.link) return null;
  return { printable, stage, href: printable.link(stage, childName), why: WHY[report.verdict](report.skill.name) };
}

export function buildReport(childName: string, progress: Progress, now = new Date()): TutorReport {
  const skills: SkillReport[] = SKILLS.map((skill) => {
    const game = skill.game ? gameById(skill.game) : null;
    const level = game ? levelOf(progress.levels, game) : 0;
    const stats = game ? skillStats(progress.rounds, game.id) : null;
    const pace = game ? speedTrend(progress.rounds, game.id).pace : null;
    const partial = {
      skill,
      game,
      level,
      stage: stageOf(level),
      pct: stats?.pct ?? null,
      rounds: stats?.rounds ?? 0,
      pace,
      missed: game ? oftenMissed(progress.rounds, game.id, 10, 2) : [],
      verdict: verdictOf(stats?.pct ?? null, stats?.rounds ?? 0, pace),
    };
    return { ...partial, note: noteFor(partial) };
  });

  const rank: Record<Verdict, number> = { focus: 0, new: 1, steady: 2, strength: 3 };
  const ordered = [...skills].sort((a, b) => rank[a.verdict] - rank[b.verdict] || (a.pct ?? 0) - (b.pct ?? 0));
  const focus = ordered.filter((s) => s.verdict === 'focus' || s.verdict === 'new').slice(0, 3);
  const strengths = skills.filter((s) => s.verdict === 'strength').sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));

  const played = skills.filter((s) => s.rounds > 0);
  const stage = played.length ? (Math.max(...played.map((s) => s.stage)) as StageNumber) : 1;
  const headline = !played.length
    ? `${childName} hasn't played a round yet — print stage 1 and start together.`
    : strengths.length && focus.length
      ? `${childName} is working at stage ${stage}. ${strengths[0].skill.name} is strongest; ${focus[0].skill.name} needs the most work.`
      : strengths.length
        ? `${childName} is working at stage ${stage} and going well across the board — ${strengths[0].skill.name} best of all.`
        : `${childName} is working at stage ${stage}. ${focus.length ? `${focus[0].skill.name} needs the most work.` : 'Keep the rounds short and frequent.'}`;

  const recommended = [...ordered.slice(0, 2), ...strengths.slice(0, 1)].map((s) => recommend(s, childName)).filter((r) => r !== null);

  return {
    childName,
    generatedAt: now.toISOString(),
    stage,
    headline,
    week: weekSummary(progress.rounds, now),
    daysThisWeek: daysPlayed(progress.rounds, now),
    skills,
    strengths,
    focus,
    recommended: recommended.filter((r, i, all) => all.findIndex((x) => x.href === r.href) === i),
    practice: ordered.slice(0, 3).map((s) => PRACTICE[s.skill.id]),
    notes: coachingNotes(progress.rounds, GAMES, now),
  };
}
