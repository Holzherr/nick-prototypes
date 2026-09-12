import { mulberry32 } from '@/shared/utils/random';

/**
 * What goes on the generated sheets. Kept out of the components so it can be tested: every one of these
 * picks from a list it has enumerated first, so a stage with few combinations prints fewer questions
 * rather than hunting forever for one that doesn't exist.
 */

/** Comparison pairs per sheet (one of them equal), and story lines on the unicorn board. */
export const PAIRS = 8;
export const STORIES = 6;

/** Fisher–Yates with a seeded source: the same sheet prints the same every time. */
function shuffled<T>(items: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const list = [...items];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/**
 * Pairs of groups to compare: different enough to be fair at stage 1, closer later, plus exactly one
 * matching pair so "the same" is a real answer.
 */
export function buildPairs(from: number, to: number, stage: number): [number, number][] {
  const gap = stage === 1 ? 2 : 1;
  const candidates: [number, number][] = [];
  for (let a = from; a <= to; a++) for (let b = from; b <= to; b++) if (Math.abs(a - b) >= gap) candidates.push([a, b]);

  const pairs = shuffled(candidates, stage * 977 + to).slice(0, PAIRS - 1);
  const rng = mulberry32(stage * 31 + to);
  const same = from + Math.floor(rng() * (to - from + 1));
  pairs.splice(Math.floor(rng() * (pairs.length + 1)), 0, [same, same]);
  return pairs;
}

/** "Three unicorns, and two more come along": the starting group and how many arrive, staying within the stage. */
export function buildStories(to: number, stage: number): [number, number][] {
  const extraMax = stage === 1 ? 1 : stage === 2 ? 2 : 3;
  const candidates: [number, number][] = [];
  for (let extra = 1; extra <= extraMax; extra++) for (let start = 1; start + extra <= to; start++) candidates.push([start, extra]);
  return shuffled(candidates, stage * 313 + to).slice(0, STORIES);
}

/** A loose scatter of `n` marks in a 100 × 60 box, so two groups can't be compared by shape alone. */
export function scatterSpots(n: number, seed: number): { x: number; y: number }[] {
  const rng = mulberry32(seed);
  const spots: { x: number; y: number }[] = [];
  let gap = 20;
  for (let attempt = 1; spots.length < n; attempt++) {
    if (attempt % 200 === 0) gap *= 0.85;
    const x = 12 + rng() * 76;
    const y = 12 + rng() * 36;
    if (spots.every((s) => Math.hypot(s.x - x, s.y - y) >= gap)) spots.push({ x, y });
  }
  return spots;
}
