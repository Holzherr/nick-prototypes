import type { GameId } from '@/features/games/catalog';
import { byTime, finished, type RoundRecord } from '@/features/games/engine';
import { DAILY_GOAL, todaySummary } from '@/features/games/insights';
import type { Progress } from '@/features/progress/model';
import { mulberry32 } from '@/shared/utils/random';

/**
 * The garden itself: the slow reward loop under the fast sticker one. Every finished round plants a
 * flower — the better the round, the more it has opened — and the garden fills up as the weeks go by.
 * It is derived from the round log, so it is the same on every device and can never drift out of sync.
 */

/** Flowers in the bed at once; after that each new round replaces the oldest. */
export const GARDEN_SIZE = 30;
/** Stickers per butterfly. */
const PER_BUTTERFLY = 10;
/** Stickers before the unicorn comes to visit. */
export const UNICORN_AT = 50;

export type Bloom = 0 | 1 | 2 | 3;

export interface Plant {
  /** The round that grew it. */
  id: string;
  game: GameId;
  /** 0 sprout, 1 bud, 2 open, 3 in full bloom (a perfect round). */
  bloom: Bloom;
  /** Percent across the bed, and 0 (back row) to 1 (front row). */
  x: number;
  depth: number;
  /** Bigger at the harder levels. */
  scale: number;
  /** Newest flower, for the pop-in. */
  fresh: boolean;
}

export interface Garden {
  plants: Plant[];
  butterflies: number;
  /** Daily goal done today. */
  rainbow: boolean;
  unicorn: boolean;
  /** Rounds played in total, and how many stickers until the next butterfly. */
  rounds: number;
  toNextButterfly: number;
}

const bloomOf = (round: RoundRecord): Bloom => {
  if (!round.total) return 0;
  const pct = round.score / round.total;
  return pct === 1 ? 3 : pct >= 0.8 ? 2 : pct >= 0.5 ? 1 : 0;
};

/** Same round, same spot: positions come from the round id so the garden never rearranges itself. */
function place(id: string, index: number) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (Math.imul(hash, 31) + id.charCodeAt(i)) | 0;
  const rng = mulberry32(hash);
  const lane = index % 6;
  return { x: (100 / 6) * lane + 4 + rng() * (100 / 6 - 8), depth: rng(), scale: 1 };
}

export function gardenOf(progress: Progress, now = new Date()): Garden {
  const played = progress.rounds.filter(finished).sort(byTime);
  const bed = played.slice(-GARDEN_SIZE);
  const plants = bed.map((round, i) => ({
    id: round.id,
    game: round.game,
    bloom: bloomOf(round),
    ...place(round.id, i),
    scale: 1 + Math.min(round.level, 4) * 0.07,
    fresh: i === bed.length - 1,
  }));
  const stickers = progress.stickers.length;
  return {
    plants: plants.sort((a, b) => a.depth - b.depth),
    butterflies: Math.min(8, Math.floor(stickers / PER_BUTTERFLY)),
    rainbow: todaySummary(progress.rounds, now).done >= DAILY_GOAL,
    unicorn: stickers >= UNICORN_AT,
    rounds: played.length,
    toNextButterfly: stickers >= 8 * PER_BUTTERFLY ? 0 : PER_BUTTERFLY - (stickers % PER_BUTTERFLY),
  };
}

/** The best thing that changed between two gardens, in the child's own words; null when nothing did. */
export function gardenNews(before: Garden, after: Garden): string | null {
  if (after.unicorn && !before.unicorn) return 'A unicorn came to visit your garden! 🦄';
  if (after.butterflies > before.butterflies) return 'A new butterfly flew into your garden! 🦋';
  if (after.rainbow && !before.rainbow) return 'A rainbow appeared over your garden! 🌈';
  const grew = after.plants.find((p) => p.fresh);
  if (!grew || grew.id === before.plants.find((p) => p.fresh)?.id) return null;
  return grew.bloom === 3 ? 'A big new flower bloomed in your garden! 🌻' : 'A new flower grew in your garden! 🌱';
}
