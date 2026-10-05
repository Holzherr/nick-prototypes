import type { Game, GameId } from './catalog';
import { accuracy, byTime, finished, LEVEL_UP_AT, levelOf, roundsOf, type Levels, type RoundRecord } from './engine';
import { makeQuest, QUEST, questFinishedToday, type Quest } from './quest';
import { translate } from '@/features/i18n/i18n';

/**
 * Which game to put in front of the child next. Five tiles is a menu, and a four-year-old picks the one
 * she is already best at — so the home screen leads with one suggestion and keeps the rest behind a tap.
 *
 * The pick moves on by itself: whatever was played last is pushed down, so finishing a round changes the
 * suggestion without anything having to remember what was shown.
 */

export type Why = 'new' | 'nearly' | 'practise' | 'today' | 'stale' | 'variety' | 'quest';

export interface Recommendation {
  game: Game;
  /** Shown to the child under the tile: short, warm, never a telling-off. */
  reason: string;
  why: Why;
  /** Set when home leads with the day's quest round instead of `game` (specs/rounds.md). */
  quest?: Quest;
}

/** Why this game is suggested, in the reader's language. The key IS the reason, so the sentence lives in
    the catalogue with every other sentence rather than in the picking logic. The quest has no catalogue entry. */
export const reasonFor = (why: Why) => (why === 'quest' ? QUEST.reason : translate(`why.${why}` as never));

const DAY = 24 * 60 * 60 * 1000;
/** Highest priority first: the reason shown is the strongest one that applied. */
const ORDER: Why[] = ['new', 'nearly', 'practise', 'today', 'stale', 'variety'];

export interface Scored {
  game: Game;
  score: number;
  why: Why;
}


export interface RecommendOptions {
  now?: Date;
  /** Pushed down the list; defaults to the game of the most recent finished round. */
  avoid?: GameId | null;
  /** Rotates ties so two equally-needed games alternate rather than one always winning. */
  rotate?: number;
  /** Passed over from home this visit, oldest first: all go after every other game, the oldest last. */
  skipped?: readonly GameId[];
  /** false: no quest this visit, because she passed the one home offered over for a game. */
  quest?: boolean;
}

const sameDay = (iso: string, now: Date) => new Date(iso).toDateString() === now.toDateString();

/** Every game scored by how much it is needed, most-needed first. */
export function rankGames(rounds: readonly RoundRecord[], levels: Levels, games: readonly Game[], options: RecommendOptions = {}): Scored[] {
  const { now = new Date(), rotate = 0, skipped = [] } = options;
  // Not skipped outranks every skipped game; among skipped ones the latest skip comes first.
  const skipRank = (id: GameId) => (skipped.includes(id) ? skipped.indexOf(id) : skipped.length);
  const lastPlayed = [...rounds].filter(finished).sort(byTime).at(-1)?.game ?? null;
  const avoid = options.avoid === undefined ? lastPlayed : options.avoid;

  return games
    .map((game, index) => {
      const played = roundsOf(rounds, game.id);
      const reasons: Why[] = [];
      let score = 0;

      if (!played.length) {
        score = 100;
        reasons.push('new');
      } else {
        const last = played[played.length - 1];
        const today = played.filter((r) => sameDay(r.playedAt, now)).length;
        const daysSince = (now.getTime() - new Date(last.playedAt).getTime()) / DAY;
        const recent = played.slice(-3);
        const pct = (100 * recent.reduce((sum, r) => sum + r.score, 0)) / Math.max(recent.reduce((sum, r) => sum + r.total, 0), 1);

        if (today === 0) {
          score += 40;
          reasons.push('today');
        } else {
          score -= 25 * today;
        }

        if (pct < 60) {
          score += 30;
          reasons.push('practise');
        } else if (pct < LEVEL_UP_AT * 100) {
          score += 12;
          reasons.push('practise');
        }

        score += Math.min(daysSince, 7) * 4;
        if (daysSince >= 3) reasons.push('stale');

        // One more good round would move it up: the most motivating thing to offer.
        if (levelOf(levels, game) < game.levels.length - 1 && last.level === levelOf(levels, game) && accuracy(last) >= LEVEL_UP_AT) {
          score += 18;
          reasons.push('nearly');
        }
      }

      if (game.id === avoid) score -= 45;
      // Ties go to the earlier skill, because the catalogue is in the order the skills are learnt — so a
      // child on day one is offered subitising, not adding. `rotate` overrides that to alternate equals.
      score += rotate ? ((index + rotate) % games.length) * 0.4 : -index * 0.05;

      const why = ORDER.find((candidate) => reasons.includes(candidate)) ?? 'variety';
      return { game, score, why };
    })
    .sort((a, b) => skipRank(b.game.id) - skipRank(a.game.id) || b.score - a.score);
}

/**
 * The one thing to lead with. A never-played game still wins outright; after that, the first quest of the
 * day (three games played, drawn from the three weakest) leads, and then the ranked game as before.
 */
export function recommendGame(rounds: readonly RoundRecord[], levels: Levels, games: readonly Game[], options: RecommendOptions = {}): Recommendation {
  const [best] = rankGames(rounds, levels, games, options);
  const offerQuest = options.quest !== false && best.why !== 'new' && !questFinishedToday(rounds, options.now);
  const quest = offerQuest ? makeQuest(rounds, levels, games) : null;
  if (quest) return { game: best.game, reason: reasonFor('quest'), why: 'quest', quest };
  return { game: best.game, reason: reasonFor(best.why), why: best.why };
}
