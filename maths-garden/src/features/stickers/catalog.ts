export type PackId = 'unicorn' | 'kpop' | 'ice';

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

const ALL = PACKS.flatMap((p) => p.stickers);
export const STICKER_TOTAL = ALL.length;

export const packById = (id: PackId): Pack => PACKS.find((p) => p.id === id) ?? PACKS[0];
export const stickerById = (id: string): Sticker | undefined => ALL.find((s) => s.id === id);

/** A sticker from the pack, preferring ones not collected yet; repeats once the pack is complete. */
export function drawSticker(pack: PackId, owned: readonly string[], rng: () => number = Math.random): Sticker {
  const all = packById(pack).stickers;
  const fresh = all.filter((s) => !owned.includes(s.id));
  const pool = fresh.length ? fresh : all;
  return pool[Math.floor(rng() * pool.length)];
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
