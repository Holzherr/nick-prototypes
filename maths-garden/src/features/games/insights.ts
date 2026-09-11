import type { Game, GameId } from './catalog';
import { accuracy, byTime, DROP_BELOW, finished, LEVEL_UP_AT, median, roundsOf, speedOf, type Pace, type RoundRecord } from './engine';

/**
 * Motivation and coaching signals from the round log: today's goal, when to suggest a break, personal
 * bests, speed trends, counting habits, level moves and plain-English notes for the grown-ups screen.
 */

/** Finished rounds a day that count as "done for today". */
export const DAILY_GOAL = 3;
/** Finished rounds in a day after which a break is suggested (about 15 minutes). */
export const BREAK_AFTER = 8;

const DAY = 24 * 60 * 60 * 1000;
const sameDay = (iso: string, now: Date) => new Date(iso).toDateString() === now.toDateString();
const todays = (rounds: readonly RoundRecord[], now: Date) => rounds.filter((r) => sameDay(r.playedAt, now)).sort(byTime);

export function todaySummary(rounds: readonly RoundRecord[], now = new Date()) {
  const list = todays(rounds, now);
  const done = list.filter(finished).length;
  return { done, quit: list.length - done, goal: DAILY_GOAL };
}

export type BreakReason = 'lots' | 'struggling' | 'quitting' | 'slowing';

/** Why a break would help right now, or null: many rounds today, two poor rounds, two quits, or a sudden slow-down. */
export function breakSuggestion(rounds: readonly RoundRecord[], now = new Date()): BreakReason | null {
  const list = todays(rounds, now);
  const done = list.filter(finished);
  if (done.length >= BREAK_AFTER) return 'lots';
  const lastTwoDone = done.slice(-2);
  if (lastTwoDone.length === 2 && lastTwoDone.every((r) => accuracy(r) < DROP_BELOW)) return 'struggling';
  const lastTwo = list.slice(-2);
  if (lastTwo.length === 2 && lastTwo.every((r) => !finished(r))) return 'quitting';
  const ratios = done.map((r) => speedOf([r]).ratio).filter((x): x is number => x !== null);
  if (ratios.length >= 4) {
    const usual = median(ratios.slice(0, -1));
    if (usual !== null && ratios[ratios.length - 1] > usual * 1.8) return 'slowing';
  }
  return null;
}

/** The fastest 80%+ round yet at this game and level (needs two earlier ones to beat). */
export function isPersonalBest(rounds: readonly RoundRecord[], round: RoundRecord): boolean {
  const ms = speedOf([round]).ms;
  if (ms === null || accuracy(round) < LEVEL_UP_AT) return false;
  const earlier = roundsOf(rounds, round.game)
    .filter((r) => r.id !== round.id && r.level === round.level && accuracy(r) >= LEVEL_UP_AT)
    .map((r) => speedOf([r]).ms)
    .filter((x): x is number => x !== null);
  return earlier.length >= 2 && ms < Math.min(...earlier);
}

export interface SpeedTrend {
  /** Median answer time over the last few rounds. */
  ms: number | null;
  pace: Pace | null;
  /** Compared with the rounds before those. */
  change: 'faster' | 'slower' | 'steady' | null;
}

export function speedTrend(rounds: readonly RoundRecord[], game: GameId, window = 3): SpeedTrend {
  const list = roundsOf(rounds, game);
  const recent = speedOf(list.slice(-window));
  const before = speedOf(list.slice(-2 * window, -window));
  let change: SpeedTrend['change'] = null;
  if (recent.ms !== null && before.ms !== null) change = recent.ms < before.ms * 0.85 ? 'faster' : recent.ms > before.ms * 1.15 ? 'slower' : 'steady';
  return { ms: recent.ms, pace: recent.pace, change };
}

/** Count With Me: share of questions where every object was tapped before answering, and taps per question. */
export function countingHabit(rounds: readonly RoundRecord[], window = 10) {
  const answers = roundsOf(rounds, 'count')
    .slice(-window)
    .flatMap((r) => r.answers)
    .filter((a) => a.counted !== undefined);
  if (!answers.length) return null;
  const countedAll = answers.filter((a) => (a.counted ?? 0) >= Number(a.target)).length;
  const taps = answers.reduce((sum, a) => sum + (a.taps ?? 0), 0);
  return { questions: answers.length, countedAllPct: Math.round((100 * countedAll) / answers.length), tapsPerQuestion: Math.round((10 * taps) / answers.length) / 10 };
}

/** Find the Number: "Hear it again" presses per question. */
export function replayHabit(rounds: readonly RoundRecord[], window = 10) {
  const answers = roundsOf(rounds, 'find')
    .slice(-window)
    .flatMap((r) => r.answers)
    .filter((a) => a.replays !== undefined);
  if (!answers.length) return null;
  const replays = answers.reduce((sum, a) => sum + (a.replays ?? 0), 0);
  return { questions: answers.length, perQuestion: Math.round((10 * replays) / answers.length) / 10 };
}

export interface LevelMove {
  game: GameId;
  from: number;
  to: number;
  at: string;
}

/** Level changes seen between consecutive finished rounds of each game, newest first. */
export function levelHistory(rounds: readonly RoundRecord[], games: readonly Game[], limit = 8): LevelMove[] {
  const moves: LevelMove[] = [];
  for (const game of games) {
    const list = roundsOf(rounds, game.id);
    for (let i = 1; i < list.length; i++) {
      if (list[i].level !== list[i - 1].level) moves.push({ game: game.id, from: list[i - 1].level, to: list[i].level, at: list[i].playedAt });
    }
  }
  return moves.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

/** Days with at least one round in the seven days up to `now`. */
export function daysPlayed(rounds: readonly RoundRecord[], now = new Date()) {
  const since = now.getTime() - 7 * DAY;
  return new Set(rounds.filter((r) => new Date(r.playedAt).getTime() > since).map((r) => new Date(r.playedAt).toDateString())).size;
}

const BREAK_NOTES: Record<BreakReason, string> = {
  lots: 'Lots of rounds today. 10–15 minutes a day is plenty at this age.',
  struggling: 'The last two rounds today were under 50%. Stop on a win and switch to real objects.',
  quitting: 'The last two rounds were left early: tired, or the level is too hard.',
  slowing: 'Answers slowed right down in the latest round. A break usually helps.',
};

/** Plain-English coaching notes for the grown-ups screen. Empty when nothing needs attention. */
export function coachingNotes(rounds: readonly RoundRecord[], games: readonly Game[], now = new Date()): string[] {
  const notes: string[] = [];
  const reason = breakSuggestion(rounds, now);
  if (reason) notes.push(BREAK_NOTES[reason]);

  const since = now.getTime() - 7 * DAY;
  const week = rounds.filter((r) => new Date(r.playedAt).getTime() > since);
  for (const game of games) {
    const quits = week.filter((r) => r.game === game.id && !finished(r)).length;
    if (quits >= 2) notes.push(`Left ${game.name} early ${quits} times this week. Try a level down, or play it together.`);
    const recent = roundsOf(rounds, game.id).slice(-3);
    if (recent.length >= 2) {
      const pct = recent.reduce((sum, r) => sum + accuracy(r), 0) / recent.length;
      if (pct >= LEVEL_UP_AT && speedOf(recent).pace === 'slow') notes.push(`${game.name}: accurate but slow. Short, frequent rounds at this level build speed.`);
    }
  }

  const counting = countingHabit(rounds);
  if (counting && counting.questions >= 5 && counting.countedAllPct < 50) {
    notes.push('Count With Me: often answers without touching every object. Practise touch-counting with real objects.');
  }
  const replays = replayHabit(rounds);
  if (replays && replays.questions >= 5 && replays.perQuestion >= 1) {
    notes.push('Find the Number: usually needs to hear the number again. Point at and say numbers together during the day.');
  }

  const last = rounds.length ? [...rounds].sort(byTime)[rounds.length - 1] : null;
  if (last && now.getTime() - new Date(last.playedAt).getTime() > 3 * DAY) notes.push('No rounds for 3 days. A short daily round keeps it fresh.');
  return notes;
}
