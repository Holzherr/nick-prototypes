import { describe, expect, it } from 'vitest';
import { mulberry32 as seeded } from '@/shared/utils/random';
import { gameById } from '../catalog';
import { makeRound, questionKey } from '../questions';
import { bankItems, drawItems } from './draw';
import type { BankLevel } from './types';

const LEVELS: BankLevel[] = [1, 2, 3, 4, 5, 6];

describe('drawing a bank round', () => {
  for (const topic of ['pattern', 'sequence'] as const) {
    it(`gives a ${topic} round five different ${topic} items at the tile's level`, () => {
      const rng = seeded(28);
      const game = gameById(topic);
      for (const level of LEVELS) {
        const ids = new Set(bankItems(topic, level).map((item) => item.id));
        for (let i = 0; i < 50; i++) {
          const round = makeRound(topic, game.levels[level - 1], rng);
          expect(round).toHaveLength(5);
          expect(new Set(round.map(questionKey)).size).toBe(5);
          for (const q of round) expect([q.game, ids.has(questionKey(q))]).toEqual([topic, true]);
        }
      }
    });
  }

  it('draws the same round from the same seed', () => {
    expect(makeRound('pattern', gameById('pattern').levels[2], seeded(5))).toEqual(makeRound('pattern', gameById('pattern').levels[2], seeded(5)));
  });

  it('gives every item of a short level once, then repeats, never the same one twice in a row', () => {
    const rng = seeded(3);
    for (let i = 0; i < 200; i++) {
      const drawn = drawItems(['a', 'b', 'c'], rng, 5);
      expect(drawn).toHaveLength(5);
      expect(new Set(drawn.slice(0, 3)).size).toBe(3);
      for (let j = 1; j < drawn.length; j++) expect(drawn[j]).not.toBe(drawn[j - 1]);
    }
    expect(drawItems(['only'], rng, 5)).toEqual(['only', 'only', 'only', 'only', 'only']);
  });

  it('turns an item into a question with its spoken prompt, row, answer and options as the bank has them', () => {
    const [q] = makeRound('sequence', gameById('sequence').levels[0], seeded(1), 1);
    const item = bankItems('sequence', 1).find((i) => i.id === questionKey(q));
    expect(q).toMatchObject({ say: item?.say, row: item?.row, answer: item?.answer, options: item?.options, show: 'numeral' });
  });
});
