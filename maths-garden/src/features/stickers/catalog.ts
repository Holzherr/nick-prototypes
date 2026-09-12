import type { StageNumber } from '@/features/curriculum/skills';

export type PackId = 'unicorn' | 'kpop' | 'ice' | 'space' | 'sea' | 'dino' | 'special';

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
  /**
   * The printable stage a child must have reached in some game before this pack appears.
   *
   * Three packs of eight looked like a fortnight of collecting and lasted two days: the unicorn and K-pop
   * packs were both complete — and sparkly-complete — by the second evening, after which every draw could
   * only hand back a duplicate. Tying the later packs to stages means the collection grows because she got
   * better, not because she kept tapping.
   */
  unlockAt: StageNumber;
  stickers: readonly Sticker[];
}

const makePack = (id: PackId, name: string, cover: string, background: string, unlockAt: StageNumber, items: readonly (readonly [string, string])[]): Pack => ({
  id,
  name,
  cover,
  background,
  unlockAt,
  stickers: items.map(([emoji, stickerName]) => ({ id: `${id}/${stickerName.replace(/\s+/g, '-')}`, pack: id, emoji, name: stickerName })),
});

/**
 * The packs offered after a finished game. Emoji art only: the K-pop and ice packs are themed on the films
 * without using the characters themselves. The first three are open from the start; the rest unlock as she
 * reaches later stages, so there is always something left to collect.
 */
export const PACKS: readonly Pack[] = [
  makePack('unicorn', 'Unicorns', '🦄', 'radial-gradient(circle at 32% 28%, #ffffff 0%, #ffd3e4 48%, #d9b8ff 100%)', 1, [
    ['🦄', 'unicorn'],
    ['🌈', 'rainbow'],
    ['🌟', 'star'],
    ['💖', 'heart'],
    ['🧁', 'cupcake'],
    ['🌙', 'moon'],
    ['🦋', 'butterfly'],
    ['🍭', 'lollipop'],
  ]),
  makePack('kpop', 'K-pop Hunters', '🎤', 'radial-gradient(circle at 32% 28%, #ffe3f6 0%, #e08cff 48%, #6a2bd1 100%)', 1, [
    ['🎤', 'microphone'],
    ['⚔️', 'swords'],
    ['⚡', 'lightning'],
    ['💜', 'purple heart'],
    ['🎧', 'headphones'],
    ['🐯', 'tiger'],
    ['🎶', 'music'],
    ['🔥', 'fire'],
  ]),
  makePack('ice', 'Ice Queen', '❄️', 'radial-gradient(circle at 32% 28%, #ffffff 0%, #d4f1ff 48%, #7cc6f2 100%)', 1, [
    ['❄️', 'snowflake'],
    ['⛄', 'snowman'],
    ['👑', 'crown'],
    ['🏰', 'castle'],
    ['💎', 'diamond'],
    ['🦌', 'reindeer'],
    ['🧊', 'ice cube'],
    ['🌨️', 'snow cloud'],
  ]),
  makePack('space', 'Space', '🚀', 'radial-gradient(circle at 32% 28%, #eef2ff 0%, #9aa8ff 48%, #2b2f77 100%)', 2, [
    ['🚀', 'rocket'],
    ['🪐', 'planet'],
    ['👩‍🚀', 'astronaut'],
    ['🛸', 'saucer'],
    ['☄️', 'comet'],
    ['🌕', 'full moon'],
    ['🛰️', 'satellite'],
    ['👽', 'alien'],
  ]),
  makePack('sea', 'Under the Sea', '🐠', 'radial-gradient(circle at 32% 28%, #e7fbff 0%, #7fd8ea 48%, #14708f 100%)', 2, [
    ['🐠', 'fish'],
    ['🐙', 'octopus'],
    ['🐬', 'dolphin'],
    ['🐳', 'whale'],
    ['🦀', 'crab'],
    ['🐚', 'shell'],
    ['🌊', 'wave'],
    ['🐢', 'turtle'],
  ]),
  makePack('dino', 'Dinosaurs', '🦕', 'radial-gradient(circle at 32% 28%, #f2ffe9 0%, #a9d98a 48%, #3f6b2a 100%)', 3, [
    ['🦕', 'long neck'],
    ['🦖', 'big teeth'],
    ['🥚', 'egg'],
    ['🌋', 'volcano'],
    ['🦴', 'bone'],
    ['🐊', 'snapper'],
    ['🌿', 'fern'],
    ['🪨', 'rock'],
  ]),
];

/** Gold stickers only Nova hands out, at milestones. Never offered in the pack chooser. */
export const SPECIAL_PACK: Pack = makePack('special', 'Special from Nova', '⭐', 'radial-gradient(circle at 32% 28%, #fffbe6 0%, #ffd66b 50%, #f0a020 100%)', 1, [
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
/** Different stickers in every regular pack, locked ones included. */
export const STICKER_TOTAL = PACKS.reduce((sum, p) => sum + p.stickers.length, 0);

/** The packs a child can choose from, given the best stage she has reached in any game. */
export const unlockedPacks = (stage: number): readonly Pack[] => PACKS.filter((p) => p.unlockAt <= stage);

/**
 * How many different stickers are collectable at this stage. The sticker book counts against this, not
 * STICKER_TOTAL: a locked pack must add nothing, or finishing every pack you can reach would still read as
 * half a collection — the opposite of the point.
 */
export const stickerTotal = (stage: number): number => unlockedPacks(stage).reduce((sum, p) => sum + p.stickers.length, 0);

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
