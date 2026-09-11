import { arrangementsFor, type Arrangement } from '@/features/resources/subitising/patterns';
import { OBJECT_SETS, QUESTIONS_PER_ROUND, type GameId, type GameLevel } from './catalog';

/** Random source in [0, 1). Injected so tests and stories are deterministic. */
export type Rng = () => number;
export type Side = 'left' | 'right';

export type Question =
  | { game: 'peek'; answer: number; options: number[]; arrangement: Arrangement; seed: number; peekMs?: number }
  | { game: 'count'; answer: number; options: number[]; emoji: string }
  | { game: 'find'; answer: number; options: number[] }
  | { game: 'add'; answer: number; options: number[]; base: number; extra: number }
  | { game: 'more'; answer: Side; left: number; right: number; leftEmoji: string; rightEmoji: string };

export type Choice = number | Side;

/** Integer in [min, max]. */
export const between = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));

const pick = <T>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)];

export const shuffle = <T>(rng: Rng, items: T[]): T[] => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

/**
 * The answer plus distinct distractors inside [min, max], shuffled. Distractors are near misses
 * (answer ± 2) where possible, because those are the mistakes worth catching.
 */
export function choices(rng: Rng, answer: number, min: number, max: number, count = 3): number[] {
  const hi = Math.max(max, answer);
  const n = Math.min(count, hi - min + 1);
  const set = new Set([answer]);
  let nearTries = 0;
  while (set.size < n) {
    const near = answer + between(rng, -2, 2);
    set.add(nearTries++ < 20 && near >= min && near <= hi ? near : between(rng, min, hi));
  }
  return shuffle(rng, [...set]);
}

/** 23 → 32: the numeral mix-up to test once numbers have two digits. */
export const swapDigits = (n: number) => Number(String(n).split('').reverse().join(''));

export function makeQuestion(game: GameId, level: GameLevel, rng: Rng = Math.random): Question {
  const { max } = level;
  const count = level.choices ?? 3;
  switch (game) {
    case 'peek': {
      const answer = between(rng, level.min ?? 1, max);
      const arrangement = pick(rng, arrangementsFor(answer)).id;
      return { game, answer, options: choices(rng, answer, 1, max, count), arrangement, seed: between(rng, 1, 9999), peekMs: level.peekMs };
    }
    case 'count': {
      const answer = between(rng, level.min ?? 1, max);
      return { game, answer, options: choices(rng, answer, 1, max, count), emoji: pick(rng, pick(rng, OBJECT_SETS)) };
    }
    case 'find': {
      const lo = level.min ?? 0;
      const answer = between(rng, lo, max);
      const options = choices(rng, answer, lo, max, 6);
      const swapped = swapDigits(answer);
      if (answer >= 12 && swapped !== answer && swapped >= lo && swapped <= max && !options.includes(swapped)) {
        options[options.findIndex((o) => o !== answer)] = swapped;
      }
      return { game, answer, options };
    }
    case 'add': {
      const base = between(rng, level.min ?? 1, max - 1);
      const extra = between(rng, 1, Math.min(level.extraMax ?? 3, max - base));
      const answer = base + extra;
      return { game, answer, base, extra, options: choices(rng, answer, 2, max, count) };
    }
    case 'more': {
      const gap = level.gap ?? max;
      const left = between(rng, level.min ?? 1, max);
      const lo = Math.max(1, left - gap);
      const hi = Math.min(max, left + gap);
      let right = between(rng, lo, hi - 1);
      if (right >= left) right += 1;
      const [leftEmoji, rightEmoji] = pick(rng, OBJECT_SETS);
      return { game, left, right, leftEmoji, rightEmoji, answer: left > right ? 'left' : 'right' };
    }
  }
}

/** What a question asks, as logged per answer ("7", "4 vs 6"). */
export const questionKey = (q: Question) => (q.game === 'more' ? `${q.left} vs ${q.right}` : String(q.answer));

/** A round of questions that never asks the same thing twice in a row. */
export function makeRound(game: GameId, level: GameLevel, rng: Rng = Math.random, count = QUESTIONS_PER_ROUND): Question[] {
  const round: Question[] = [];
  let retries = 0;
  while (round.length < count) {
    const q = makeQuestion(game, level, rng);
    const prev = round[round.length - 1];
    if (prev && questionKey(prev) === questionKey(q) && retries++ < 20) continue;
    round.push(q);
  }
  return round;
}
