import { describe, expect, it } from 'vitest';
import { collected, drawReward, drawSticker, packById, PACKS, SPECIAL_PACK, STICKER_TOTAL, stickerById, tiltOf, withArticle } from './catalog';

/**
 * The 65 ids that were in the catalogue before each pack grew to sixteen. maths_stickers.sticker stores the id,
 * so every one of these stays, in this order, at the front of its pack; new stickers only ever go after them.
 */
const ORIGINAL_NAMES = {
  unicorn: 'unicorn rainbow star heart cupcake moon butterfly lollipop',
  kpop: 'microphone swords lightning purple-heart headphones tiger music fire',
  ice: 'snowflake snowman crown castle diamond reindeer ice-cube snow-cloud',
  space: 'rocket planet astronaut saucer comet full-moon satellite alien',
  sea: 'fish octopus dolphin whale crab shell wave turtle angler-fish',
  dino: 'long-neck big-teeth egg volcano bone snapper fern rock',
  garden: 'sunflower bee snail toadstool acorn caterpillar nest clover',
  night: 'galaxy owl bat crescent telescope candle shooting-comet bedtime',
} as const;

describe('sticker catalog', () => {
  it('has sixteen stickers in every regular pack and ten special ones', () => {
    for (const pack of PACKS) expect(pack.stickers.length).toBeGreaterThanOrEqual(16);
    expect(STICKER_TOTAL).toBe(129);
    expect(SPECIAL_PACK.stickers).toHaveLength(10);
  });

  it('keeps the 65 original ids byte for byte, first in their packs', () => {
    let kept = 0;
    for (const [pack, names] of Object.entries(ORIGINAL_NAMES)) {
      const ids = names.split(' ').map((n) => `${pack}/${n}`);
      expect(packById(pack as keyof typeof ORIGINAL_NAMES).stickers.slice(0, ids.length).map((s) => s.id)).toEqual(ids);
      kept += ids.length;
    }
    expect(kept).toBe(65);
  });

  it('never repeats an emoji or a name inside a pack', () => {
    for (const pack of [...PACKS, SPECIAL_PACK]) {
      expect(new Set(pack.stickers.map((s) => s.emoji)).size).toBe(pack.stickers.length);
      expect(new Set(pack.stickers.map((s) => s.name)).size).toBe(pack.stickers.length);
    }
  });

  it('still has fresh stickers to give once the original eight are owned', () => {
    const originals = ORIGINAL_NAMES.unicorn.split(' ').map((n) => `unicorn/${n}`);
    const records = originals.map((sticker) => ({ sticker, shiny: false }));
    for (let i = 0; i < 40; i++) {
      const { sticker, sparkly } = drawReward('unicorn', records);
      expect(originals).not.toContain(sticker.id);
      expect(sticker.pack).toBe('unicorn');
      expect(sparkly).toBe(false);
    }
  });

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

describe('the angler fish', () => {
  it('lives in the sea pack under an id that will never change', () => {
    const angler = stickerById('sea/angler-fish');
    expect(angler).toMatchObject({ pack: 'sea', name: 'angler fish', art: 'anglerfish' });
  });
});
