import { describe, expect, it } from 'vitest';
import { arrangementsFor } from '@/features/resources/subitising/patterns';
import { mulberry32 as seeded } from '@/shared/utils/random';
import { gameById, GAMES, type GameId, type GameLevel } from './catalog';
import { between, choices, makeQuestion, makeRound, questionKey, swapDigits } from './questions';
import { SHAPE_IDS, SHAPES } from './shapes';

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
              break;
            case 'bond':
              // Never "5 and none make 5", and the two parts always make the whole.
              expect(q.shown).toBeGreaterThanOrEqual(1);
              expect(q.shown).toBeLessThan(q.whole);
              expect(q.answer).toBe(q.whole - q.shown);
              expect(level.wholes ?? [level.max]).toContain(q.whole);
              expect(q.frame).toBe(!level.hideFrame);
              expect(q.options).toContain(q.answer);
              break;
            case 'fewer':
              expect(q.base).toBeGreaterThanOrEqual(Math.max(level.min ?? 2, 2));
              expect(q.base).toBeLessThanOrEqual(level.max);
              expect(q.taken).toBeGreaterThanOrEqual(1);
              expect(q.taken).toBeLessThanOrEqual(level.takeMax ?? 1);
              expect(q.answer).toBe(q.base - q.taken);
              expect(q.answer).toBeGreaterThanOrEqual(1);
              expect(q.options).toContain(q.answer);
              break;
            case 'teen':
              expect(q.answer).toBeGreaterThanOrEqual(11);
              expect(q.answer).toBeLessThanOrEqual(level.max);
              expect(q.extra).toBe(q.answer - 10);
              expect(q.frame).toBe(!level.hideFrame);
              expect(q.options).toContain(q.answer);
              expect(q.options).toHaveLength(level.choices ?? 3);
              break;
            case 'shape': {
              const allowed = level.shapes ?? SHAPE_IDS;
              expect(allowed).toContain(q.answer);
              expect(q.options).toContain(q.answer);
              expect(new Set(q.options).size).toBe(q.options.length);
              for (const id of q.options) expect(allowed).toContain(id);
              // Whatever is being asked, exactly one option can be the answer.
              const sides = SHAPES[q.answer].sides;
              if (q.ask === 'sides') {
                expect(sides).toBeGreaterThan(0);
                expect(q.options.filter((id) => SHAPES[id].sides === sides)).toHaveLength(1);
              }
              expect(level.spin ? q.rotate : 0).toBe(q.rotate);
            }
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

  it('asks five different questions when the level has enough to choose from', () => {
    const rng = seeded(11);
    for (let i = 0; i < 100; i++) {
      expect(new Set(makeRound('find', { max: 20 }, rng).map(questionKey)).size).toBe(5);
    }
  });
});

describe('Spot the Shape', () => {
  it('brings in pentagons and hexagons at stage 3, not before', () => {
    const [one, two, three] = gameById('shape').levels;
    for (const shape of ['pentagon', 'hexagon'] as const) {
      expect(one.shapes).not.toContain(shape);
      expect(two.shapes).not.toContain(shape);
      expect(three.shapes).toContain(shape);
    }
  });

  it('asks for a side count often enough to be a real second question, and only on shapes that have sides', () => {
    const rng = seeded(21);
    const top = gameById('shape').levels[4];
    let bySides = 0;
    for (let i = 0; i < 600; i++) {
      const q = makeQuestion('shape', top, rng);
      if (q.game !== 'shape' || q.ask !== 'sides') continue;
      bySides++;
      expect(SHAPES[q.answer].sides).toBeGreaterThan(0);
      expect(q.options.filter((id) => SHAPES[id].sides === SHAPES[q.answer].sides)).toHaveLength(1);
    }
    expect(bySides).toBeGreaterThan(100);
  });

  it('never asks for a side count below the top level', () => {
    const rng = seeded(22);
    for (const level of gameById('shape').levels.slice(0, 4)) {
      for (let i = 0; i < 200; i++) {
        const q = makeQuestion('shape', level, rng);
        if (q.game === 'shape') expect(q.ask).toBe('name');
      }
    }
  });
});

/**
 * A level that can ask fewer different questions than the level below it is a bug, however much bigger its
 * numbers are: the child meets the same handful of questions again and sees the game as finished.
 */
describe('level curves', () => {
  const poolOf = (game: GameId, level: GameLevel): number => {
    const rng = seeded(9);
    const keys = new Set<string>();
    for (let i = 0; i < 4000; i++) keys.add(questionKey(makeQuestion(game, level, rng)));
    return keys.size;
  };

  it('widens Make Ten at every level instead of repeating one table of bonds', () => {
    const pools = gameById('bond').levels.map((level) => poolOf('bond', level));
    expect(pools).toEqual([...pools].sort((a, b) => a - b));
    expect(pools[4]).toBeGreaterThan(40);
  });

  it('keeps the fastest Quick Peek levels as varied as level 3', () => {
    const pools = gameById('peek').levels.map((level) => poolOf('peek', level));
    for (const pool of pools.slice(3)) expect(pool).toBeGreaterThanOrEqual(pools[2]);
  });

  it('gives every game a gold level to reach', () => {
    for (const game of GAMES) expect(game.levels).toHaveLength(6);
  });

  /**
   * The gold Which Has More? level asks neighbours (7 against 8), which by its nature can ask less than a
   * loose gap can. Opening the range down to 2 is what keeps it from becoming the same few pairs.
   */
  it('keeps the gold Which Has More? level varied despite only asking neighbours', () => {
    const pools = gameById('more').levels.map((level) => poolOf('more', level));
    expect(pools[5]).toBeGreaterThan(30);
  });

  it('records the biggest whole Make Ten can ask as the level max', () => {
    for (const level of gameById('bond').levels) {
      if (level.wholes) expect(Math.max(...level.wholes)).toBe(level.max);
    }
  });
});
