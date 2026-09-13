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
export const GARDEN_SIZE = 42;
/** Stickers per butterfly. */
const PER_BUTTERFLY = 10;
/** Most butterflies the garden holds. */
const MAX_BUTTERFLIES = 16;
/** Finished rounds per tree: the slowest thing in the garden, and the one that marks months rather than days. */
const PER_TREE = 25;
/** Most trees the garden holds. */
const MAX_TREES = 5;
/** Stickers before the unicorn comes to visit. */
export const UNICORN_AT = 50;
/** Stickers before a pond appears, with a duck on it. The last thing to arrive, and a long way past the unicorn. */
export const POND_AT = 120;

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
  /** One per 25 finished rounds: the slow marker of months of play. */
  trees: number;
  /** Daily goal done today. */
  rainbow: boolean;
  unicorn: boolean;
  /** A pond with a duck, a long way past the unicorn. */
  pond: boolean;
  /** Rounds played in total, and how many stickers/rounds until the next butterfly and tree. */
  rounds: number;
  toNextButterfly: number;
  toNextTree: number;
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
  const trees = Math.min(MAX_TREES, Math.floor(played.length / PER_TREE));
  return {
    plants: plants.sort((a, b) => a.depth - b.depth),
    butterflies: Math.min(MAX_BUTTERFLIES, Math.floor(stickers / PER_BUTTERFLY)),
    trees,
    rainbow: todaySummary(progress.rounds, now).done >= DAILY_GOAL,
    unicorn: stickers >= UNICORN_AT,
    pond: stickers >= POND_AT,
    rounds: played.length,
    toNextButterfly: stickers >= MAX_BUTTERFLIES * PER_BUTTERFLY ? 0 : PER_BUTTERFLY - (stickers % PER_BUTTERFLY),
    toNextTree: trees >= MAX_TREES ? 0 : PER_TREE - (played.length % PER_TREE),
  };
}

/**
 * The best thing that changed between two gardens, in the child's own words; null when nothing did.
 * Rarest first: a butterfly arrives with the same sticker that fills the pond, and the pond is the one
 * worth hearing about.
 */
export function gardenNews(before: Garden, after: Garden): string | null {
  if (after.pond && !before.pond) return 'A pond appeared in your garden, with a duck on it! 🦆';
  if (after.unicorn && !before.unicorn) return 'A unicorn came to visit your garden! 🦄';
  if (after.trees > before.trees) return 'A tree grew in your garden! 🌳';
  if (after.butterflies > before.butterflies) return 'A new butterfly flew into your garden! 🦋';
  if (after.rainbow && !before.rainbow) return 'A rainbow appeared over your garden! 🌈';
  const grew = after.plants.find((p) => p.fresh);
  if (!grew || grew.id === before.plants.find((p) => p.fresh)?.id) return null;
  return grew.bloom === 3 ? 'A big new flower bloomed in your garden! 🌻' : 'A new flower grew in your garden! 🌱';
}
