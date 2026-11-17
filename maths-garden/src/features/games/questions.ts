import { arrangementsFor, type Arrangement } from '@/features/resources/subitising/patterns';
import { bankItems, drawItems, type BankGameId, type BankGameItem } from './bank/draw';
import type { BankLevel } from './bank/types';
import { OBJECT_SETS, QUESTIONS_PER_ROUND, type GameId, type GameLevel } from './catalog';
import { SHAPE_IDS, SHAPES, type ShapeId } from './shapes';

/** Random source in [0, 1). Injected so tests and stories are deterministic. */
export type Rng = () => number;
export type Side = 'left' | 'right';

export type Question =
  | { game: 'peek'; answer: number; options: number[]; arrangement: Arrangement; seed: number; peekMs?: number }
  | { game: 'count'; answer: number; options: number[]; emoji: string }
  | { game: 'find'; answer: number; options: number[] }
  | { game: 'add'; answer: number; options: number[]; base: number; extra: number }
  | { game: 'more'; answer: Side; left: number; right: number; leftEmoji: string; rightEmoji: string }
  /** How many more to make `whole`, with `shown` already there. */
  | { game: 'bond'; answer: number; options: number[]; whole: number; shown: number; frame: boolean }
  /** `base` balloons, `taken` float away. */
  | { game: 'fewer'; answer: number; options: number[]; base: number; taken: number; emoji: string }
  /** A full ten and `extra` loose ones. */
  | { game: 'teen'; answer: number; options: number[]; extra: number; frame: boolean }
  /**
   * Which one is the hexagon (`ask: 'name'`), or which one has six sides (`ask: 'sides'`). `rotate` turns
   * every shape on screen by the same angle, so the shape has to be read rather than recognised as a picture.
   */
  | { game: 'shape'; answer: ShapeId; options: ShapeId[]; ask: 'name' | 'sides'; rotate: number }
  /** A question-bank item: `item` is its id, `say` is spoken, `row` has one gap (null), `show` says how to draw it. */
  | { game: BankGameId; item: string; say: string; show: 'numeral'; row: (number | null)[]; answer: number; options: number[] }
  | { game: 'pattern'; item: string; say: string; show: 'emoji'; row: (string | null)[]; answer: string; options: string[] };

export type BankQuestion = Extract<Question, { item: string }>;

/** What was tapped: a number, a side, a shape, or a picture from a bank item. */
export type Choice = number | Side | ShapeId | string;

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

/**
 * The answer plus other shapes from the level's set. When the question asks for a side count, every wrong
 * option must have a different number of sides: a square and a diamond both have four, and a child who taps
 * either one is right.
 */
export function shapeChoices(rng: Rng, answer: ShapeId, pool: readonly ShapeId[], count: number, bySides: boolean): ShapeId[] {
  const usable = (id: ShapeId) => id !== answer && (!bySides || SHAPES[id].sides !== SHAPES[answer].sides);
  const rest = shuffle(rng, pool.filter(usable));
  return shuffle(rng, [answer, ...rest.slice(0, Math.max(1, count - 1))]);
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
    case 'bond': {
      // Never the whole and never nothing: "5 and none make 5" teaches nothing at this age.
      const whole = level.wholes ? pick(rng, level.wholes) : max;
      const shown = between(rng, 1, whole - 1);
      const answer = whole - shown;
      return { game, whole, shown, answer, frame: !level.hideFrame, options: choices(rng, answer, 1, whole - 1, count) };
    }
    case 'fewer': {
      const base = between(rng, Math.max(level.min ?? 2, 2), max);
      const taken = between(rng, 1, Math.min(level.takeMax ?? 1, base - 1));
      const answer = base - taken;
      return { game, base, taken, answer, emoji: '🎈', options: choices(rng, answer, 1, max - 1, count) };
    }
    case 'teen': {
      const answer = between(rng, Math.max(level.min ?? 11, 11), max);
      return { game, answer, extra: answer - 10, frame: !level.hideFrame, options: choices(rng, answer, 11, max, count) };
    }
    case 'shape': {
      const pool = level.shapes ?? SHAPE_IDS;
      const sided = pool.filter((id) => SHAPES[id].sides > 0);
      // Where both questions are allowed they alternate at random, so she cannot settle into one habit.
      const ask = level.bySides && sided.length > 2 && rng() < 0.5 ? 'sides' : 'name';
      const answer = pick(rng, ask === 'sides' ? sided : pool);
      return { game, answer, ask, options: shapeChoices(rng, answer, pool, count, ask === 'sides'), rotate: level.spin ? between(rng, 0, 11) * 30 : 0 };
    }
    case 'pattern':
    case 'sequence':
      return bankQuestion(pick(rng, bankItems(game, max as BankLevel)));
  }
}

/** A bank item as a question: options and their order exactly as the bank has them. */
function bankQuestion(item: BankGameItem): BankQuestion {
  const { id, say, row, answer, options } = item;
  return typeof answer === 'string'
    ? { game: 'pattern', item: id, say, show: 'emoji', row: row as (string | null)[], answer, options: options as string[] }
    : { game: item.topic, item: id, say, show: 'numeral', row: row as (number | null)[], answer, options: options as number[] };
}

/** What a question asks, as logged per answer ("7", "4 vs 6", "3+?=5", "pattern-3-07"). */
export function questionKey(q: Question): string {
  if ('item' in q) return q.item;
  switch (q.game) {
    case 'more':
      return `${q.left} vs ${q.right}`;
    case 'bond':
      return `${q.shown}+?=${q.whole}`;
    case 'fewer':
      return `${q.base}−${q.taken}`;
    default:
      return String(q.answer);
  }
}

/**
 * A round of questions, preferring ones this round has not asked at all and never asking the same thing
 * twice in a row. The easiest levels have fewer distinct questions than a round has slots (there are only
 * three ways to flash 1–3 dots), so a repeat is sometimes unavoidable — it just never lands back to back.
 */
export function makeRound(game: GameId, level: GameLevel, rng: Rng = Math.random, count = QUESTIONS_PER_ROUND): Question[] {
  // A bank level is a fixed list, so it is dealt like cards rather than generated and retried.
  if (game === 'pattern' || game === 'sequence') return drawItems(bankItems(game, level.max as BankLevel), rng, count).map(bankQuestion);
  const round: Question[] = [];
  const asked = new Set<string>();
  while (round.length < count) {
    let q = makeQuestion(game, level, rng);
    for (let i = 0; i < 40 && asked.has(questionKey(q)); i++) q = makeQuestion(game, level, rng);
    const prev = round[round.length - 1];
    for (let i = 0; i < 20 && prev && questionKey(prev) === questionKey(q); i++) q = makeQuestion(game, level, rng);
    round.push(q);
    asked.add(questionKey(q));
  }
  return round;
}
