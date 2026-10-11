import { describe, expect, it } from 'vitest';
import bank from './question-bank.json';
import type { BankItem, BankTopic, OptionShow } from './types';

const items = bank as BankItem[];

/**
 * How much of each round type the bank holds: at least `perLevel` items at every level 1–6, each drawn in a
 * `show` its kind already used when the floor was set, so a round's tile can draw every item. One entry per
 * round type; a round type grown later adds its own line.
 */
const COVERAGE: { topic: BankTopic; perLevel: number; show: Record<string, OptionShow[]> }[] = [
  { topic: 'pattern', perLevel: 40, show: { repeat: ['emoji'], 'count-by': ['numeral'] } },
];

/** UK money only, and no film, TV, game or toy brands. */
const BANNED = /\$|dollar|cent|disney|elsa|peppa|bluey|paw patrol|mickey|pokemon|spider-man|lego|barbie|frozen|minecraft/i;
const banned = (item: BankItem) =>
  Object.values(item)
    .flat()
    .filter((v): v is string => typeof v === 'string' && BANNED.test(v));

describe('question bank coverage', () => {
  for (const { topic, perLevel, show } of COVERAGE) {
    const ofTopic = items.filter((i) => i.topic === topic);

    it(`holds at least ${perLevel} ${topic} items at every level`, () => {
      for (const level of [1, 2, 3, 4, 5, 6]) expect(ofTopic.filter((i) => i.level === level).length, `level ${level}`).toBeGreaterThanOrEqual(perLevel);
    });

    it(`draws every ${topic} item in a show its kind already uses`, () => {
      for (const item of ofTopic) expect(show[(item as { kind: string }).kind] ?? [], item.id).toContain(item.show);
    });

    it(`has no two ${topic} items at one level with the same row and options`, () => {
      const seen = new Set(ofTopic.map((i) => JSON.stringify([i.level, 'row' in i ? i.row : null, i.options])));
      expect(seen.size).toBe(ofTopic.length);
    });
  }

  it('gives every item its own id', () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it('names no dollars, cents or brand characters', () => {
    expect(items.flatMap((i) => banned(i).map((text) => `${i.id}: ${text}`))).toEqual([]);
  });

  it('catches each banned word, whatever its case', () => {
    const story = items.find((i) => i.topic === 'story')!;
    for (const word of ['$2', 'DOLLAR', 'fifty cents', 'Disney', 'Elsa', 'Peppa', 'Bluey', 'Paw Patrol', 'Mickey', 'Pokemon', 'Spider-Man', 'Lego', 'Barbie', 'Frozen', 'Minecraft'])
      expect(banned({ ...story, say: `Look at ${word}. How many?` } as BankItem), word).toHaveLength(1);
  });
});
