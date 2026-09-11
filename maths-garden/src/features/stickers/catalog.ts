export type PackId = 'unicorn' | 'kpop' | 'ice' | 'special';

export interface Sticker {
  /** "<pack>/<name>", stored in maths_stickers.sticker; never rename one that has been handed out. */
  id: string;
  pack: PackId;
  emoji: string;
  name: string;
}

export interface Pack {
  id: PackId;
  name: string;
  cover: string;
  /** CSS background of the sticker disc. */
  background: string;
  stickers: readonly Sticker[];
}

const makePack = (id: PackId, name: string, cover: string, background: string, items: readonly (readonly [string, string])[]): Pack => ({
  id,
  name,
  cover,
  background,
  stickers: items.map(([emoji, stickerName]) => ({ id: `${id}/${stickerName.replace(/\s+/g, '-')}`, pack: id, emoji, name: stickerName })),
});

/**
 * The three packs offered after every finished game. Emoji art only: the K-pop and ice packs are
 * themed on the films without using the characters themselves.
 */
export const PACKS: readonly Pack[] = [
  makePack('unicorn', 'Unicorns', '🦄', 'radial-gradient(circle at 32% 28%, #ffffff 0%, #ffd3e4 48%, #d9b8ff 100%)', [
    ['🦄', 'unicorn'],
    ['🌈', 'rainbow'],
    ['🌟', 'star'],
    ['💖', 'heart'],
    ['🧁', 'cupcake'],
    ['🌙', 'moon'],
    ['🦋', 'butterfly'],
    ['🍭', 'lollipop'],
  ]),
  makePack('kpop', 'K-pop Hunters', '🎤', 'radial-gradient(circle at 32% 28%, #ffe3f6 0%, #e08cff 48%, #6a2bd1 100%)', [
    ['🎤', 'microphone'],
    ['⚔️', 'swords'],
    ['⚡', 'lightning'],
    ['💜', 'purple heart'],
    ['🎧', 'headphones'],
    ['🐯', 'tiger'],
    ['🎶', 'music'],
    ['🔥', 'fire'],
  ]),
  makePack('ice', 'Ice Queen', '❄️', 'radial-gradient(circle at 32% 28%, #ffffff 0%, #d4f1ff 48%, #7cc6f2 100%)', [
    ['❄️', 'snowflake'],
    ['⛄', 'snowman'],
    ['👑', 'crown'],
    ['🏰', 'castle'],
    ['💎', 'diamond'],
    ['🦌', 'reindeer'],
    ['🧊', 'ice cube'],
    ['🌨️', 'snow cloud'],
  ]),
];

/** Gold stickers only Nova hands out, at milestones. Never offered in the pack chooser. */
export const SPECIAL_PACK: Pack = makePack('special', 'Special from Nova', '⭐', 'radial-gradient(circle at 32% 28%, #fffbe6 0%, #ffd66b 50%, #f0a020 100%)', [
  ['👑', 'golden crown'],
  ['🏆', 'trophy'],
  ['💫', 'superstar'],
  ['🎖️', 'medal'],
  ['🌠', 'shooting star'],
  ['🪄', 'magic wand'],
  ['🦄', 'golden unicorn'],
  ['🎤', 'star microphone'],
  ['💎', 'giant gem'],
  ['🌈', 'golden rainbow'],
]);

const ALL = [...PACKS, SPECIAL_PACK].flatMap((p) => p.stickers);
/** Different stickers in the regular packs. */
export const STICKER_TOTAL = PACKS.reduce((sum, p) => sum + p.stickers.length, 0);

export const packById = (id: PackId): Pack => [...PACKS, SPECIAL_PACK].find((p) => p.id === id) ?? PACKS[0];
export const stickerById = (id: string): Sticker | undefined => ALL.find((s) => s.id === id);
export const isSpecial = (id: string) => id.startsWith('special/');

const pick = <T>(items: readonly T[], rng: () => number) => items[Math.floor(rng() * items.length)];

/** A sticker from the pack, preferring ones not collected yet; repeats once the pack is complete. */
export function drawSticker(pack: PackId, owned: readonly string[], rng: () => number = Math.random): Sticker {
  const all = packById(pack).stickers;
  const fresh = all.filter((s) => !owned.includes(s.id));
  return pick(fresh.length ? fresh : all, rng);
}

/**
 * What a pick from a pack gives: a new sticker while the pack has gaps; once it's complete, sparkly copies
 * until the sparkly set is done too; after that, repeats.
 */
export function drawReward(pack: PackId, records: readonly { sticker: string; shiny: boolean }[], rng: () => number = Math.random) {
  const all = packById(pack).stickers;
  const owned = collected(records);
  const fresh = all.filter((s) => !owned.has(s.id));
  if (fresh.length) return { sticker: pick(fresh, rng), sparkly: false };
  const dull = all.filter((s) => !owned.get(s.id)?.shiny);
  if (dull.length) return { sticker: pick(dull, rng), sparkly: true };
  return { sticker: pick(all, rng), sparkly: false };
}

/** How far a pack is collected, normally and sparkly. */
export function packProgress(pack: Pack, records: readonly { sticker: string; shiny: boolean }[]) {
  const owned = collected(records);
  const have = pack.stickers.filter((s) => owned.has(s.id)).length;
  const sparkly = pack.stickers.filter((s) => owned.get(s.id)?.shiny).length;
  const total = pack.stickers.length;
  return { have, sparkly, total, complete: have === total, sparklyComplete: sparkly === total };
}

/** A fixed tilt per sticker (−8° to 8°), so the book looks hand-stuck but never reshuffles. */
export function tiltOf(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return (Math.abs(h) % 17) - 8;
}

/** "a rainbow", "an ice cube", "a unicorn". */
export const withArticle = (name: string) => (/^([aeio]|u(?!ni))/i.test(name) ? `an ${name}` : `a ${name}`);

/** How many of each sticker a child has, and whether any copy is shiny. */
export function collected(records: readonly { sticker: string; shiny: boolean }[]) {
  const map = new Map<string, { count: number; shiny: boolean }>();
  for (const r of records) {
    const cur = map.get(r.sticker);
    map.set(r.sticker, { count: (cur?.count ?? 0) + 1, shiny: (cur?.shiny ?? false) || r.shiny });
  }
  return map;
}
