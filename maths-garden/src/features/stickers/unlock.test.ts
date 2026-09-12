import { describe, expect, it } from 'vitest';
import { PACKS, packById, stickerTotal, unlockedPacks } from './catalog';

/**
 * Three packs of eight looked like a fortnight of collecting and lasted two days. The later packs arrive
 * with the stages, so there is always something left to collect — but only what she can reach may count
 * towards the book's total, or finishing everything available would still read as half a collection.
 */
describe('unlocking packs', () => {
  it('opens with the first three and nothing else', () => {
    expect(unlockedPacks(1).map((p) => p.id)).toEqual(['unicorn', 'kpop', 'ice']);
  });

  it('adds packs as the stages are reached', () => {
    expect(unlockedPacks(2).map((p) => p.id)).toContain('space');
    expect(unlockedPacks(2).map((p) => p.id)).toContain('sea');
    expect(unlockedPacks(2).map((p) => p.id)).not.toContain('dino');
    expect(unlockedPacks(3).map((p) => p.id)).toContain('dino');
  });

  it('counts only what she can reach, so a full collection never reads as half done', () => {
    // The bug this guards: adding packs moved the book from "24 of 24" to "24 of 48" overnight.
    expect(stickerTotal(1)).toBe(24);
    expect(stickerTotal(3)).toBe(PACKS.reduce((sum, p) => sum + p.stickers.length, 0));
    expect(stickerTotal(1)).toBeLessThan(stickerTotal(3));
  });

  it('never lets a pack unlock below stage 1 or go missing at stage 3', () => {
    expect(unlockedPacks(0)).toHaveLength(0);
    expect(unlockedPacks(3)).toHaveLength(PACKS.length);
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
