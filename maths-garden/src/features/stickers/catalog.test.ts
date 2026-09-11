import { describe, expect, it } from 'vitest';
import { collected, drawSticker, packById, PACKS, stickerById, tiltOf, withArticle } from './catalog';

describe('sticker catalog', () => {
  it('has unique ids that round-trip', () => {
    const ids = PACKS.flatMap((p) => p.stickers.map((s) => s.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(stickerById(id)?.id).toBe(id);
  });

  it('draws a sticker not collected yet while there is one', () => {
    const unicorn = packById('unicorn').stickers.map((s) => s.id);
    const owned = unicorn.slice(0, -1);
    for (let i = 0; i < 20; i++) expect(drawSticker('unicorn', owned).id).toBe(unicorn[unicorn.length - 1]);
  });

  it('repeats from the same pack once it is complete', () => {
    const ice = packById('ice').stickers.map((s) => s.id);
    expect(ice).toContain(drawSticker('ice', ice).id);
  });

  it('tilts each sticker the same way every time', () => {
    expect(tiltOf('kpop/tiger')).toBe(tiltOf('kpop/tiger'));
    for (const p of PACKS) for (const s of p.stickers) expect(Math.abs(tiltOf(s.id))).toBeLessThanOrEqual(8);
  });

  it('picks a or an', () => {
    expect(withArticle('rainbow')).toBe('a rainbow');
    expect(withArticle('ice cube')).toBe('an ice cube');
    expect(withArticle('unicorn')).toBe('a unicorn');
  });

  it('counts duplicates and remembers shiny copies', () => {
    const map = collected([
      { sticker: 'unicorn/rainbow', shiny: false },
      { sticker: 'unicorn/rainbow', shiny: true },
      { sticker: 'ice/crown', shiny: false },
    ]);
    expect(map.get('unicorn/rainbow')).toEqual({ count: 2, shiny: true });
    expect(map.get('ice/crown')).toEqual({ count: 1, shiny: false });
  });
});
