import { describe, expect, it } from 'vitest';
import { CHARACTERS, characterById, characterFor } from './characters';
import { justGrew, stageOf, TOP_STAGE } from './stage';

const nova = characterById('nova');

describe('stageOf', () => {
  it('shows the first stage for a child with no rounds, then one more at each threshold, up to the top', () => {
    expect(stageOf(nova, 0)).toBe(1);
    expect(nova.stagesAt.map((at) => stageOf(nova, at - 1))).toEqual([1, 2, 3, 4]);
    expect(nova.stagesAt.map((at) => stageOf(nova, at))).toEqual([2, 3, 4, 5]);
    expect(stageOf(nova, 10_000)).toBe(TOP_STAGE);
  });

  it('never falls as rounds go up', () => {
    let last = 0;
    for (let rounds = 0; rounds <= 200; rounds++) {
      expect(stageOf(nova, rounds)).toBeGreaterThanOrEqual(last);
      last = stageOf(nova, rounds);
    }
  });

  it('reads the thresholds from the character, so a second one grows at its own pace', () => {
    expect(stageOf({ ...nova, stagesAt: [1, 2, 3, 4] }, 4)).toBe(5);
    expect(stageOf(nova, 4)).toBe(1);
  });

  it('knows the round that lifted her a stage', () => {
    expect([0, nova.stagesAt[0], nova.stagesAt[0] + 1].map((r) => justGrew(nova, r))).toEqual([false, true, false]);
  });
});

describe('the character list', () => {
  it('starts with Nova, gives a child without a character field the first entry, and has a line naming the child per stage', () => {
    expect(CHARACTERS[0].id).toBe('nova');
    expect(characterFor({ id: 'child-1' })).toBe(CHARACTERS[0]);
    for (const character of CHARACTERS) {
      expect(character.lines).toHaveLength(TOP_STAGE);
      for (const line of character.lines) expect(line('Ada')).toContain('Ada');
    }
  });
});
