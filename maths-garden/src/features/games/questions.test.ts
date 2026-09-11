import { describe, expect, it } from 'vitest';
import { arrangementsFor } from '@/features/resources/subitising/patterns';
import { mulberry32 as seeded } from '@/shared/utils/random';
import { gameById, GAMES } from './catalog';
import { between, choices, makeQuestion, makeRound, questionKey, swapDigits } from './questions';

describe('choices', () => {
  it('includes the answer, has no duplicates and stays in range', () => {
    const rng = seeded(1);
    for (let i = 0; i < 500; i++) {
      const max = between(rng, 3, 20);
      const answer = between(rng, 1, max);
      const opts = choices(rng, answer, 1, max);
      expect(opts).toContain(answer);
      expect(new Set(opts).size).toBe(3);
      for (const o of opts) {
        expect(o).toBeGreaterThanOrEqual(1);
        expect(o).toBeLessThanOrEqual(max);
      }
    }
  });

  it('shrinks to the range when the range is smaller than the count', () => {
    expect(choices(seeded(2), 1, 1, 2).sort()).toEqual([1, 2]);
  });
});

describe('makeQuestion', () => {
  it('keeps every game inside every level’s rules', () => {
    const rng = seeded(3);
    for (const game of GAMES) {
      for (const level of game.levels) {
        const lo = level.min ?? (game.id === 'find' ? 0 : 1);
        for (let i = 0; i < 200; i++) {
          const q = makeQuestion(game.id, level, rng);
          switch (q.game) {
            case 'more':
              expect(q.left).not.toBe(q.right);
              expect(Math.max(q.left, q.right)).toBeLessThanOrEqual(level.max);
              expect(Math.min(q.left, q.right)).toBeGreaterThanOrEqual(1);
              expect(Math.abs(q.left - q.right)).toBeLessThanOrEqual(level.gap ?? level.max);
              expect(q.answer).toBe(q.left > q.right ? 'left' : 'right');
              break;
            case 'add':
              expect(q.base).toBeGreaterThanOrEqual(lo);
              expect(q.extra).toBeGreaterThanOrEqual(1);
              expect(q.extra).toBeLessThanOrEqual(level.extraMax ?? 3);
              expect(q.answer).toBe(q.base + q.extra);
              expect(q.answer).toBeLessThanOrEqual(level.max);
              expect(q.options).toContain(q.answer);
              expect(q.options).toHaveLength(level.choices ?? 3);
              break;
            case 'find':
              expect(q.answer).toBeGreaterThanOrEqual(lo);
              expect(q.answer).toBeLessThanOrEqual(level.max);
              expect(new Set(q.options).size).toBe(6);
              expect(q.options).toContain(q.answer);
              break;
            case 'peek':
              expect(arrangementsFor(q.answer).map((a) => a.id)).toContain(q.arrangement);
              expect(q.answer).toBeGreaterThanOrEqual(lo);
              expect(q.answer).toBeLessThanOrEqual(level.max);
              expect(q.peekMs).toBe(level.peekMs);
              expect(q.options).toHaveLength(level.choices ?? 3);
              break;
            case 'count':
              expect(q.answer).toBeGreaterThanOrEqual(lo);
              expect(q.answer).toBeLessThanOrEqual(level.max);
              expect(q.options).toContain(q.answer);
              expect(q.options).toHaveLength(level.choices ?? 3);
          }
        }
      }
    }
  });

  it('offers the swapped-digit numeral as a trap on two-digit numbers', () => {
    const rng = seeded(5);
    const top = gameById('find').levels[4];
    let checked = 0;
    for (let i = 0; i < 400; i++) {
      const q = makeQuestion('find', top, rng);
      if (q.game !== 'find') continue;
      const swapped = swapDigits(q.answer);
      if (q.answer < 12 || swapped === q.answer || swapped < (top.min ?? 0) || swapped > top.max) continue;
      expect(q.options).toContain(swapped);
      checked++;
    }
    expect(checked).toBeGreaterThan(50);
  });
});

describe('makeRound', () => {
  it('never asks the same question twice in a row', () => {
    const rng = seeded(4);
    for (let i = 0; i < 100; i++) {
      const round = makeRound('peek', { max: 3 }, rng);
      expect(round).toHaveLength(5);
      for (let j = 1; j < round.length; j++) expect(questionKey(round[j])).not.toBe(questionKey(round[j - 1]));
    }
  });
});
