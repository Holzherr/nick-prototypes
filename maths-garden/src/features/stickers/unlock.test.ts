import { describe, expect, it } from 'vitest';
import { PACKS, packById, stickerTotal, unlockedPacks } from './catalog';

/** Nine games, each at some printable stage. */
const stages = (...values: number[]) => values;
const allAt = (stage: number) => Array.from({ length: 9 }, () => stage);

/**
 * Three packs of eight looked like a fortnight of collecting and lasted two days. The later packs are
 * earned by getting better across several games, so there is always something left to collect — but only
 * what she can reach may count towards the book's total, or finishing everything available would still
 * read as half a collection.
 */
describe('unlocking packs', () => {
  it('opens with the first three and nothing else', () => {
    expect(unlockedPacks(allAt(1)).map((p) => p.id)).toEqual(['unicorn', 'kpop', 'ice']);
  });

  /**
   * The bug this guards: unlocking keyed off the best single game, so one game reaching stage 3 opened
   * every pack at once — 48 stickers collectable in an afternoon, and nothing left to earn afterwards.
   */
  it('will not open the catalogue on the strength of one game', () => {
    const oneStrongGame = stages(3, 1, 1, 1, 1, 1, 1, 1, 1);
    expect(unlockedPacks(oneStrongGame).map((p) => p.id)).toEqual(['unicorn', 'kpop', 'ice']);
    expect(stickerTotal(oneStrongGame)).toBe(24);
  });

  it('adds packs as more games reach a stage', () => {
    expect(unlockedPacks(stages(2, 2, 1, 1, 1, 1, 1, 1, 1)).map((p) => p.id)).toContain('space');
    expect(unlockedPacks(stages(2, 2, 1, 1, 1, 1, 1, 1, 1)).map((p) => p.id)).not.toContain('sea');
    expect(unlockedPacks(stages(2, 2, 2, 2, 1, 1, 1, 1, 1)).map((p) => p.id)).toContain('sea');
    expect(unlockedPacks(stages(3, 3, 1, 1, 1, 1, 1, 1, 1)).map((p) => p.id)).toContain('dino');
  });

  it('keeps the last two packs as something to work towards', () => {
    const fiveAtThree = stages(3, 3, 3, 3, 3, 2, 2, 1, 1);
    expect(unlockedPacks(fiveAtThree).map((p) => p.id)).not.toContain('garden');
    expect(unlockedPacks(stages(3, 3, 3, 3, 3, 3, 3, 1, 1)).map((p) => p.id)).toContain('garden');
    expect(unlockedPacks(stages(3, 3, 3, 3, 3, 3, 3, 3, 1)).map((p) => p.id)).not.toContain('night');
    expect(unlockedPacks(allAt(3)).map((p) => p.id)).toContain('night');
  });

  it('counts only what she can reach, so a full collection never reads as half done', () => {
    // The bug this guards: adding packs moved the book from "24 of 24" to "24 of 48" overnight.
    expect(stickerTotal(allAt(1))).toBe(24);
    expect(stickerTotal(allAt(3))).toBe(PACKS.reduce((sum, p) => sum + p.stickers.length, 0));
    expect(stickerTotal(allAt(1))).toBeLessThan(stickerTotal(allAt(3)));
  });

  it('never lets a pack unlock below stage 1 or go missing once everything is reached', () => {
    expect(unlockedPacks([])).toHaveLength(0);
    expect(unlockedPacks(allAt(0))).toHaveLength(0);
    expect(unlockedPacks(allAt(3))).toHaveLength(PACKS.length);
  });

  /**
   * maths_stickers.sticker stores "<pack>/<name>" and there are already dozens of rows in the live
   * database. Renaming one would orphan every sticker a child has earned, so the ids are a contract.
   */
  it('keeps every existing sticker id byte for byte', () => {
    expect(packById('unicorn').stickers.map((s) => s.id)).toEqual([
      'unicorn/unicorn',
      'unicorn/rainbow',
      'unicorn/star',
      'unicorn/heart',
      'unicorn/cupcake',
      'unicorn/moon',
      'unicorn/butterfly',
      'unicorn/lollipop',
    ]);
    expect(packById('kpop').stickers.map((s) => s.id)).toEqual([
      'kpop/microphone',
      'kpop/swords',
      'kpop/lightning',
      'kpop/purple-heart',
      'kpop/headphones',
      'kpop/tiger',
      'kpop/music',
      'kpop/fire',
    ]);
    expect(packById('ice').stickers.map((s) => s.id)).toEqual([
      'ice/snowflake',
      'ice/snowman',
      'ice/crown',
      'ice/castle',
      'ice/diamond',
      'ice/reindeer',
      'ice/ice-cube',
      'ice/snow-cloud',
    ]);
  });

  it('gives every pack eight stickers and a unique id', () => {
    for (const pack of PACKS) expect(pack.stickers).toHaveLength(8);
    const ids = PACKS.flatMap((p) => p.stickers.map((s) => s.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
