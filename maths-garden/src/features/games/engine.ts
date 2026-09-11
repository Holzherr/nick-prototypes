import type { Game, GameId } from './catalog';

/** One answered question. `target` is what was asked ("7", "4 vs 6"), `chosen` what was tapped. */
export interface AnswerRecord {
  target: string;
  chosen: string;
  correct: boolean;
  ms: number;
}

/** One play of a game. `id` is made on the device so a retried upload is harmless. */
export interface RoundRecord {
  id: string;
  childId: string;
  game: GameId;
  level: number;
  score: number;
  total: number;
  answers: AnswerRecord[];
  playedAt: string;
}

export type Levels = Partial<Record<GameId, number>>;

export const LEVEL_UP_AT = 0.8;
export const DROP_BELOW = 0.5;
export const STREAK = 2;

const accuracy = (r: Pick<RoundRecord, 'score' | 'total'>) => (r.total ? r.score / r.total : 0);
const byTime = (a: RoundRecord, b: RoundRecord) => a.playedAt.localeCompare(b.playedAt);
const roundsOf = (rounds: readonly RoundRecord[], game: GameId) => rounds.filter((r) => r.game === game).sort(byTime);

export const levelOf = (levels: Levels, game: Game) => Math.min(Math.max(levels[game.id] ?? 0, 0), game.levels.length - 1);

/**
 * The level after the latest round. A perfect round at the current level moves up straight away. Otherwise
 * the last two rounds of this game must both be at the current level: both 80%+ moves up, both under 50%
 * drops back.
 */
export function nextLevel(rounds: readonly RoundRecord[], game: Game, level: number): number {
  const recent = roundsOf(rounds, game.id).slice(-STREAK);
  const top = game.levels.length - 1;
  const latest = recent.at(-1);
  if (latest && latest.level === level && latest.total > 0 && latest.score === latest.total && level < top) return level + 1;
  if (recent.length < STREAK || recent.some((r) => r.level !== level)) return level;
  if (recent.every((r) => accuracy(r) >= LEVEL_UP_AT) && level < top) return level + 1;
  if (recent.every((r) => accuracy(r) < DROP_BELOW) && level > 0) return level - 1;
  return level;
}

export interface SkillStats {
  pct: number;
  rounds: number;
}

/** Accuracy over the last `window` rounds of a game, or null if it has never been played. */
export function skillStats(rounds: readonly RoundRecord[], game: GameId, window = 3): SkillStats | null {
  const recent = roundsOf(rounds, game).slice(-window);
  if (!recent.length) return null;
  const score = recent.reduce((sum, r) => sum + r.score, 0);
  const total = recent.reduce((sum, r) => sum + r.total, 0);
  return { pct: Math.round((100 * score) / total), rounds: recent.length };
}

/** What a grown-up should do next for this skill. */
export function advice(stats: SkillStats | null, level: number, game: Game): string {
  if (!stats) return 'Not played yet.';
  if (stats.pct >= 80) {
    return level < game.levels.length - 1
      ? 'Doing great. A perfect round, or two in a row at 80%+, moves up a level.'
      : 'Top level. Stretch with bigger numbers using real objects.';
  }
  if (stats.pct >= 50) return 'Nearly there. Keep practising at this level.';
  return 'Finding it hard. Practise with real objects (buttons, grapes) before more screen rounds.';
}

/** The targets answered wrongly most often in the last `window` rounds, most-missed first. */
export function oftenMissed(rounds: readonly RoundRecord[], game: GameId, window = 10, limit = 3) {
  const misses = new Map<string, number>();
  for (const round of roundsOf(rounds, game).slice(-window)) {
    for (const a of round.answers) if (!a.correct) misses.set(a.target, (misses.get(a.target) ?? 0) + 1);
  }
  return [...misses.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([target, count]) => ({ target, count }));
}

/** Rounds, distinct days and minutes of answering in the seven days up to `now`. */
export function weekSummary(rounds: readonly RoundRecord[], now = new Date()) {
  const since = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const week = rounds.filter((r) => new Date(r.playedAt).getTime() > since);
  const days = new Set(week.map((r) => new Date(r.playedAt).toDateString())).size;
  const ms = week.reduce((sum, r) => sum + r.answers.reduce((s, a) => s + a.ms, 0), 0);
  return { rounds: week.length, days, minutes: Math.round(ms / 60000) };
}
