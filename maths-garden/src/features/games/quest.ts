import { QUESTIONS_PER_ROUND, gameById, type Game, type GameId } from './catalog';
import { finished, levelOf, skillStats, type AnswerRecord, type Levels, type RoundRecord } from './engine';
import { makeRound, type Question, type Rng } from './questions';

/**
 * The quest round (specs/rounds.md): five questions from the child's three weakest skills, each drawn by
 * its own game's generator at that game's current level. A new shape of round, not a new game — so it has
 * no generator, no levels and no id in the catalogue. Every answer is scored to the game that asked it.
 */

/** How the quest is shown on the home tile. English, like the wind-down lines: it lives in no catalogue. */
export const QUEST = { emoji: '🗺️', name: 'Quest', reason: 'Three games in one round! 🗺️' } as const;

/** Games in one quest. */
export const QUEST_GAMES = 3;

/** Which game fills each of the five slots, weakest first: two each from the two weakest, one from the third. */
const SLOTS = [0, 1, 2, 0, 1];

export interface Quest {
  /** The three weakest skills' games, weakest first. */
  games: Game[];
  /** Each source game's level when the quest was drawn; every answer is scored to it. */
  levels: Levels;
  questions: Question[];
}

/**
 * The games with finished rounds, weakest first: accuracy over the last three finished rounds, the window
 * the grown-ups screen shows. A tie goes to the game earlier in the catalogue, the order the skills are learnt.
 */
export function weakestGames(rounds: readonly RoundRecord[], games: readonly Game[]): Game[] {
  return games
    .map((game, index) => ({ game, index, stats: skillStats(rounds, game.id) }))
    .filter((entry) => entry.stats !== null)
    .sort((a, b) => (a.stats?.pct ?? 0) - (b.stats?.pct ?? 0) || a.index - b.index)
    .map((entry) => entry.game);
}

/** A quest for this child, or null when fewer than three games have been played. */
export function makeQuest(rounds: readonly RoundRecord[], levels: Levels, games: readonly Game[], rng: Rng = Math.random): Quest | null {
  const weakest = weakestGames(rounds, games).slice(0, QUEST_GAMES);
  if (weakest.length < QUEST_GAMES) return null;
  const questLevels: Levels = {};
  for (const game of weakest) questLevels[game.id] = levelOf(levels, game);
  // Each game draws its own questions as one short round, so its no-repeat rule still holds within the quest.
  const drawn = weakest.map((game) => makeRound(game.id, game.levels[questLevels[game.id] ?? 0], rng, SLOTS.filter((slot) => slot === weakest.indexOf(game)).length));
  const questions = SLOTS.slice(0, QUESTIONS_PER_ROUND).map((slot) => drawn[slot].shift() as Question);
  return { games: weakest, levels: questLevels, questions };
}

/** The game a quest question belongs to. */
export const sourceOf = (question: Question): Game => gameById(question.game);

/**
 * One round row per source game, all sharing one `playedAt`: the quest's answers land in each game's
 * history and `agent_snapshot` counts them under that game with no migration. `completed` false when the
 * quest was given up part-way, as a round left early is recorded.
 */
export function questRounds(quest: Quest, answers: readonly AnswerRecord[], childId: string, completed: boolean, now = new Date(), id: () => string = () => crypto.randomUUID()): RoundRecord[] {
  const playedAt = now.toISOString();
  const byGame = new Map<GameId, AnswerRecord[]>();
  quest.questions.forEach((question, i) => {
    if (i >= answers.length) return;
    byGame.set(question.game, [...(byGame.get(question.game) ?? []), answers[i]]);
  });
  return [...byGame.entries()].map(([gameId, own]) => {
    const game = gameById(gameId);
    const level = quest.levels[gameId] ?? 0;
    return {
      id: id(),
      childId,
      game: gameId,
      level,
      score: own.filter((a) => a.correct).length,
      total: own.length,
      answers: own,
      playedAt,
      ...(completed ? {} : { completed: false }),
      levelMax: game.levels[level]?.max,
    };
  });
}

const sameDay = (iso: string, now: Date) => new Date(iso).toDateString() === now.toDateString();

/**
 * Whether a quest was finished today. Its rows are ordinary rounds with no column to say so; what marks
 * them is that two or more games finished at the very same instant, which one round at a time never does.
 */
export function questFinishedToday(rounds: readonly RoundRecord[], now = new Date()): boolean {
  const games = new Map<string, Set<GameId>>();
  for (const round of rounds) {
    if (!finished(round) || !sameDay(round.playedAt, now)) continue;
    games.set(round.playedAt, (games.get(round.playedAt) ?? new Set<GameId>()).add(round.game));
  }
  return [...games.values()].some((set) => set.size > 1);
}
