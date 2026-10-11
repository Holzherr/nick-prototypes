import { describe, expect, it } from 'vitest';
import bank from './question-bank.json';
import type { BankItem, BankTopic, OptionShow, StoryItem } from './types';

const items = bank as BankItem[];
const stories = items.filter((i): i is StoryItem => i.topic === 'story');

/**
 * How much of each round type the bank holds: at least `perLevel` items at every level 1–6, each drawn in a
 * `show` its kind already used when the floor was set, so a round's tile can draw every item. One entry per
 * round type; a round type grown later adds its own line.
 */
const COVERAGE: { topic: BankTopic; perLevel: number; show: Record<string, OptionShow[]> }[] = [
  { topic: 'pattern', perLevel: 40, show: { repeat: ['emoji'], 'count-by': ['numeral'] } },
  { topic: 'sequence', perLevel: 40, show: { after: ['numeral'], before: ['numeral'], missing: ['numeral'] } },
];

/**
 * Story floors for the adding and taking-away rounds, which take one story at the game's level from level 2
 * (level 1 stays pictures only). Every story is drawn as numerals, the only `show` stories used when the
 * floor was set.
 */
const STORY = { levels: [2, 3, 4, 5, 6], perLevel: 40, perOp: { add: 15, take: 15 }, show: ['numeral'] as OptionShow[] };

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

  it(`holds at least ${STORY.perLevel} story items at levels 2-6, enough adding and taking away at each`, () => {
    for (const level of STORY.levels) {
      const atLevel = stories.filter((i) => i.level === level);
      expect(atLevel.length, `level ${level}`).toBeGreaterThanOrEqual(STORY.perLevel);
      for (const [op, floor] of Object.entries(STORY.perOp))
        expect(atLevel.filter((i) => i.op === op).length, `level ${level} ${op}`).toBeGreaterThanOrEqual(floor);
    }
  });

  it('draws every story item in a show stories already use', () => {
    for (const item of stories) expect(STORY.show, item.id).toContain(item.show);
  });

  it('never says the same story twice at one level', () => {
    const seen = new Set(stories.map((i) => `${i.level} ${i.say}`));
    expect(seen.size).toBe(stories.length);
  });

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
