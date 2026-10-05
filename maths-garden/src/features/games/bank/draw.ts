import { shuffle, type Rng } from '../questions';
import bank from './question-bank.json';
import type { BankItem, BankLevel, PatternItem, SequenceItem } from './types';

/** The bank topics that are games of their own (specs/question-bank.md). */
export type BankGameId = 'pattern' | 'sequence';
export type BankGameItem = PatternItem | SequenceItem;

const items = bank as BankItem[];

/** Every item of one topic at one level, in bank order. */
export const bankItems = (topic: BankGameId, level: BankLevel): BankGameItem[] =>
  items.filter((item): item is BankGameItem => item.topic === topic && item.level === level);

/**
 * `count` items from `pool`, none twice while any is unused. A pool smaller than `count` gives every item
 * once and then starts again from a fresh shuffle, never putting the same item twice in a row.
 */
export function drawItems<T>(pool: readonly T[], rng: Rng, count: number): T[] {
  if (pool.length === 0) throw new Error('Nothing to draw from');
  const drawn: T[] = [];
  while (drawn.length < count) {
    const next = shuffle(rng, [...pool]);
    if (next.length > 1 && next[0] === drawn[drawn.length - 1]) next.push(next.shift() as T);
    drawn.push(...next.slice(0, count - drawn.length));
  }
  return drawn;
}
