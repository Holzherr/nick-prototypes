import type { Game, GameId } from '@/features/games/catalog';
import { accuracy, byTime, finished, median, roundsOf, speedOf, type RoundRecord } from '@/features/games/engine';
import type { LevelEvent, LevelReason, Progress } from './model';

/**
 * Progress over time, for the grown-ups' charts. Everything here is derived from the round log and the
 * level events, so two devices showing the same child show the same history.
 */

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export interface Point {
  /** Short label for the axis ("8 Sep"). */
  label: string;
  /** Start of the bucket. */
  at: string;
  /** null when nothing was played that week. */
  value: number | null;
  /** How many rounds the value came from. */
  rounds: number;
}

/** Monday-start week buckets, oldest first, including empty weeks so gaps are visible. */
function weekBuckets(weeks: number, now: Date): { start: Date; end: Date }[] {
  const monday = startOfDay(now);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: weeks }, (_, i) => {
    const start = new Date(monday.getTime() - (weeks - 1 - i) * WEEK);
    return { start, end: new Date(start.getTime() + WEEK) };
  });
}

const label = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

const inWeek = (round: RoundRecord, start: Date, end: Date) => {
  const at = new Date(round.playedAt).getTime();
  return at >= start.getTime() && at < end.getTime();
};

/** Accuracy per week for one game (or every game when `game` is omitted), as a percentage. */
export function weeklyAccuracy(rounds: readonly RoundRecord[], game: GameId | null, weeks = 8, now = new Date()): Point[] {
  const list = (game ? roundsOf(rounds, game) : rounds.filter(finished)).sort(byTime);
  return weekBuckets(weeks, now).map(({ start, end }) => {
    const week = list.filter((r) => inWeek(r, start, end));
    const total = week.reduce((sum, r) => sum + r.total, 0);
    const score = week.reduce((sum, r) => sum + r.score, 0);
    return { label: label(start), at: start.toISOString(), value: total ? Math.round((100 * score) / total) : null, rounds: week.length };
  });
}

/** Median seconds per answer per week — the fluency line, which should fall as accuracy holds. */
export function weeklySpeed(rounds: readonly RoundRecord[], game: GameId | null, weeks = 8, now = new Date()): Point[] {
  const list = (game ? roundsOf(rounds, game) : rounds.filter(finished)).sort(byTime);
  return weekBuckets(weeks, now).map(({ start, end }) => {
    const week = list.filter((r) => inWeek(r, start, end));
    const ms = speedOf(week).ms;
    return { label: label(start), at: start.toISOString(), value: ms === null ? null : Math.round(ms / 100) / 10, rounds: week.length };
  });
}

export interface DayCount {
  date: string;
  rounds: number;
  /** Rounds left early that day. */
  quit: number;
}

/** Rounds per day for the last `days` days, oldest first: the "did we actually do it" strip. */
export function activityByDay(rounds: readonly RoundRecord[], days = 56, now = new Date()): DayCount[] {
  const counts = new Map<string, { rounds: number; quit: number }>();
  for (const round of rounds) {
    const key = isoDay(new Date(round.playedAt));
    const entry = counts.get(key) ?? { rounds: 0, quit: 0 };
    if (finished(round)) entry.rounds += 1;
    else entry.quit += 1;
    counts.set(key, entry);
  }
  const today = startOfDay(now);
  return Array.from({ length: days }, (_, i) => {
    const date = isoDay(new Date(today.getTime() - (days - 1 - i) * DAY));
    return { date, ...(counts.get(date) ?? { rounds: 0, quit: 0 }) };
  });
}

/**
 * Every level change, newest first. Recorded events are the truth; for play from before the event log
 * existed the change is inferred from the level of the next round, which is all the old data allows.
 */
export function levelChanges(progress: Progress, games: readonly Game[]): LevelEvent[] {
  if (progress.levelEvents.length) return [...progress.levelEvents].sort((a, b) => b.at.localeCompare(a.at));
  const inferred: LevelEvent[] = [];
  for (const game of games) {
    const list = roundsOf(progress.rounds, game.id);
    for (let i = 1; i < list.length; i++) {
      if (list[i].level === list[i - 1].level) continue;
      const reason: LevelReason = list[i].level > list[i - 1].level ? 'earned' : 'dropped';
      inferred.push({ id: `inferred-${list[i].id}`, childId: list[i].childId, game: game.id, from: list[i - 1].level, to: list[i].level, reason, at: list[i].playedAt });
    }
  }
  return inferred.sort((a, b) => b.at.localeCompare(a.at));
}

export interface LevelStep {
  at: string;
  level: number;
}

/** The level a game sat at over time, oldest first, ending at where it is now. */
export function levelTimeline(progress: Progress, game: Game, now = new Date()): LevelStep[] {
  const changes = levelChanges(progress, [game])
    .filter((e) => e.game === game.id)
    .sort((a, b) => a.at.localeCompare(b.at));
  const played = roundsOf(progress.rounds, game.id);
  const startedAt = played[0]?.playedAt ?? changes[0]?.at;
  if (!startedAt) return [];
  const steps: LevelStep[] = [{ at: startedAt, level: changes[0]?.from ?? progress.levels[game.id] ?? 0 }];
  for (const change of changes) steps.push({ at: change.at, level: change.to });
  steps.push({ at: now.toISOString(), level: progress.levels[game.id] ?? steps[steps.length - 1].level });
  return steps;
}

export interface Mastery {
  target: string;
  right: number;
  wrong: number;
  pct: number;
}

/** How every number asked has gone, hardest first: the most concrete thing a parent can act on. */
export function masteryByTarget(rounds: readonly RoundRecord[], game: GameId, window = 40): Mastery[] {
  const tally = new Map<string, { right: number; wrong: number }>();
  for (const round of roundsOf(rounds, game).slice(-window)) {
    for (const answer of round.answers) {
      const entry = tally.get(answer.target) ?? { right: 0, wrong: 0 };
      if (answer.correct) entry.right += 1;
      else entry.wrong += 1;
      tally.set(answer.target, entry);
    }
  }
  return [...tally.entries()]
    .map(([target, { right, wrong }]) => ({ target, right, wrong, pct: Math.round((100 * right) / (right + wrong)) }))
    .sort((a, b) => a.pct - b.pct || b.wrong - a.wrong);
}

export interface HistorySummary {
  /** First and latest finished round. */
  firstPlayed: string | null;
  lastPlayed: string | null;
  rounds: number;
  questions: number;
  /** Minutes spent answering, all time. */
  minutes: number;
  days: number;
  /** Longest run of consecutive days with a finished round. */
  bestStreak: number;
  /** Accuracy over the first and the most recent ten rounds, for a then-and-now line. */
  firstTen: number | null;
  lastTen: number | null;
  movesUp: number;
  movesDown: number;
}

const pctOf = (rounds: readonly RoundRecord[]): number | null => {
  const total = rounds.reduce((sum, r) => sum + r.total, 0);
  return total ? Math.round((100 * rounds.reduce((sum, r) => sum + r.score, 0)) / total) : null;
};

export function historySummary(progress: Progress, games: readonly Game[]): HistorySummary {
  const played = progress.rounds.filter(finished).sort(byTime);
  const days = [...new Set(played.map((r) => isoDay(new Date(r.playedAt))))].sort();
  let best = 0;
  let run = 0;
  for (let i = 0; i < days.length; i++) {
    const previous = i > 0 ? new Date(days[i - 1]).getTime() : null;
    run = previous !== null && new Date(days[i]).getTime() - previous === DAY ? run + 1 : 1;
    best = Math.max(best, run);
  }
  const changes = levelChanges(progress, games);
  return {
    firstPlayed: played[0]?.playedAt ?? null,
    lastPlayed: played.at(-1)?.playedAt ?? null,
    rounds: played.length,
    questions: played.reduce((sum, r) => sum + r.total, 0),
    minutes: Math.round(played.reduce((sum, r) => sum + r.answers.reduce((s, a) => s + (a.totalMs ?? a.ms), 0), 0) / 60000),
    days: days.length,
    bestStreak: best,
    firstTen: pctOf(played.slice(0, 10)),
    lastTen: pctOf(played.slice(-10)),
    movesUp: changes.filter((c) => c.to > c.from).length,
    movesDown: changes.filter((c) => c.to < c.from).length,
  };
}

/** Median answer time across the last rounds of a game, in seconds, for the "is it getting quicker" line. */
export const secondsPerAnswer = (rounds: readonly RoundRecord[], game: GameId, window = 5): number | null => {
  const ms = speedOf(roundsOf(rounds, game).slice(-window)).ms;
  return ms === null ? null : Math.round(ms / 100) / 10;
};

/** Accuracy of every finished round of a game, oldest first — the scatter behind the weekly average. */
export const roundScores = (rounds: readonly RoundRecord[], game: GameId) =>
  roundsOf(rounds, game).map((r) => ({ at: r.playedAt, pct: Math.round(100 * accuracy(r)), level: r.level }));

export const medianOf = median;
