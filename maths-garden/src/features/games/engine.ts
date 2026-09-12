import type { Game, GameId } from './catalog';

/** One answered question. `target` is what was asked ("7", "4 vs 6"), `chosen` what was tapped. */
export interface AnswerRecord {
  target: string;
  chosen: string;
  correct: boolean;
  /** Answer time: from the answer buttons appearing to the tap (Count With Me includes the counting). */
  ms: number;
  /** Whole question, from the prompt appearing (includes the Quick Peek flash and the unicorn animation). */
  totalMs?: number;
  /** Count With Me: taps on objects before answering, repeat taps included. */
  taps?: number;
  /** Count With Me: different objects tapped. */
  counted?: number;
  /** Find the Number: "Hear it again" presses. */
  replays?: number;
  /** Asked from the level below after two misses in a row. */
  eased?: boolean;
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
  /** false when the child left mid-round; missing means finished. */
  completed?: boolean;
  /**
   * The biggest number this level could ask, recorded with the round. Levels get retuned and new ones get
   * added, so difficulty has to stay readable later without depending on today's catalogue.
   */
  levelMax?: number;
}

export type Levels = Partial<Record<GameId, number>>;

export const LEVEL_UP_AT = 0.8;
export const DROP_BELOW = 0.5;
export const STREAK = 2;

export const accuracy = (r: Pick<RoundRecord, 'score' | 'total'>) => (r.total ? r.score / r.total : 0);
export const byTime = (a: RoundRecord, b: RoundRecord) => a.playedAt.localeCompare(b.playedAt);
export const finished = (r: RoundRecord) => r.completed !== false;

/** Finished rounds of one game, oldest first. Rounds left early never count towards levels or stats. */
export const roundsOf = (rounds: readonly RoundRecord[], game: GameId) => rounds.filter((r) => r.game === game && finished(r)).sort(byTime);

export const median = (values: readonly number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** Answer-time target per question. Count With Me includes the counting, so it grows with the number. */
export function targetMs(game: GameId, target: string): number {
  switch (game) {
    case 'peek':
      return 2500;
    case 'count':
      return 2000 + 1200 * (Number(target) || 1);
    case 'find':
      return 3500;
    case 'more':
      return 2500;
    case 'add':
      return 3000;
    // Bonds are a recall question once the frame goes: worth a little longer before it counts as slow.
    case 'bond':
      return 3500;
    case 'fewer':
      return 3000;
    case 'teen':
      return 3000;
  }
}

/** Fluent: at or under target. Steady: up to twice the target. Slow: beyond that. */
export type Pace = 'fluent' | 'steady' | 'slow';
export const paceOf = (ratio: number | null): Pace | null => (ratio === null ? null : ratio <= 1 ? 'fluent' : ratio <= 2 ? 'steady' : 'slow');

/** Median answer time, and median time ÷ target, over the correct answers of some rounds. */
export function speedOf(rounds: readonly RoundRecord[]) {
  const answers = rounds.flatMap((r) => r.answers.filter((a) => a.correct).map((a) => ({ ms: a.ms, ratio: a.ms / targetMs(r.game, a.target) })));
  const ratio = median(answers.map((a) => a.ratio));
  return { ms: median(answers.map((a) => a.ms)), ratio, pace: paceOf(ratio) };
}

export const levelOf = (levels: Levels, game: Game) => Math.min(Math.max(levels[game.id] ?? 0, 0), game.levels.length - 1);

const isSlow = (r: RoundRecord) => speedOf([r]).pace === 'slow';

/**
 * The level after the latest finished round. Speed counts as well as accuracy:
 * - a perfect round moves up straight away, unless the answers were slow;
 * - two rounds in a row at the current level, both 80%+, move up unless both were slow (then stay and build speed);
 * - two in a row under 50% drop back.
 */
export function nextLevel(rounds: readonly RoundRecord[], game: Game, level: number): number {
  const recent = roundsOf(rounds, game.id).slice(-STREAK);
  const top = game.levels.length - 1;
  const latest = recent.at(-1);
  if (!latest) return level;
  if (latest.level === level && latest.total > 0 && latest.score === latest.total && !isSlow(latest) && level < top) return level + 1;
  if (recent.length < STREAK || recent.some((r) => r.level !== level)) return level;
  if (recent.every((r) => accuracy(r) >= LEVEL_UP_AT) && !recent.every(isSlow) && level < top) return level + 1;
  if (recent.every((r) => accuracy(r) < DROP_BELOW) && level > 0) return level - 1;
  return level;
}

/** After two misses in a row, the next question is asked from the level below. */
export const shouldEase = (answers: readonly AnswerRecord[]) => answers.length >= 2 && !answers[answers.length - 1].correct && !answers[answers.length - 2].correct;

/** Correct answers in a row at the end of a list. */
export function streakOf(answers: readonly AnswerRecord[]): number {
  let n = 0;
  for (let i = answers.length - 1; i >= 0 && answers[i].correct; i--) n++;
  return n;
}

export interface SkillStats {
  pct: number;
  rounds: number;
}

/** Accuracy over the last `window` finished rounds of a game, or null if it has never been played. */
export function skillStats(rounds: readonly RoundRecord[], game: GameId, window = 3): SkillStats | null {
  const recent = roundsOf(rounds, game).slice(-window);
  if (!recent.length) return null;
  const score = recent.reduce((sum, r) => sum + r.score, 0);
  const total = recent.reduce((sum, r) => sum + r.total, 0);
  return { pct: Math.round((100 * score) / total), rounds: recent.length };
}

/** What a grown-up should do next for this skill. */
export function advice(stats: SkillStats | null, level: number, game: Game, pace: Pace | null = null): string {
  if (!stats) return 'Not played yet.';
  if (stats.pct >= 80) {
    if (pace === 'slow') return 'Accurate but slow. Short, frequent rounds at this level build speed before moving up.';
    return level < game.levels.length - 1
      ? 'Doing great. A quick perfect round, or two in a row at 80%+, moves up a level.'
      : 'Top level. Stretch with bigger numbers using real objects.';
  }
  if (stats.pct >= 50) return 'Nearly there. Keep practising at this level.';
  return 'Finding it hard. Practise with real objects (buttons, grapes) before more screen rounds.';
}

/** The targets answered wrongly most often in the last `window` finished rounds, most-missed first. */
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

/** Finished rounds, rounds left early, distinct days and minutes of answering in the seven days up to `now`. */
export function weekSummary(rounds: readonly RoundRecord[], now = new Date()) {
  const since = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const week = rounds.filter((r) => new Date(r.playedAt).getTime() > since);
  const done = week.filter(finished);
  const days = new Set(week.map((r) => new Date(r.playedAt).toDateString())).size;
  const ms = week.reduce((sum, r) => sum + r.answers.reduce((s, a) => s + (a.totalMs ?? a.ms), 0), 0);
  return { rounds: done.length, quit: week.length - done.length, days, minutes: Math.round(ms / 60000) };
}
