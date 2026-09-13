import type { Game } from '@/features/games/catalog';
import { levelOf, mastered, type Levels, type RoundRecord } from '@/features/games/engine';
import { collected, isSpecial, packProgress, SPECIAL_PACK, unlockedPacks } from './catalog';

type StickerLike = { sticker: string; shiny: boolean };

/** Something worth a visit from Nova. Each one reached is owed exactly one special sticker. */
export interface Milestone {
  key: string;
  line: (name: string) => string;
}

const COUNTS = [5, 10, 20, 30, 40, 50, 75, 100, 150, 200];

/**
 * Every milestone reached so far, in a fixed order: sticker counts, finished packs, sparkly packs, game
 * levels 3 and 5, and mastering a game outright. `rounds` is optional so callers that only know the levels
 * still work — they simply never see the mastery milestone, which is the only one the round log can decide.
 */
export function milestonesReached(records: readonly StickerLike[], levels: Levels, games: readonly Game[], rounds: readonly RoundRecord[] = []): Milestone[] {
  const regular = records.filter((r) => !isSpecial(r.sticker));
  const list: Milestone[] = [];
  for (const n of COUNTS) {
    if (regular.length >= n) list.push({ key: `stickers-${n}`, line: (name) => `Wow, ${name}! You've got ${n} stickers!` });
  }
  // Only packs she can actually reach: a locked pack has nothing collected, and counting it would let Nova
  // owe a burst of specials the moment it unlocks, for work that was never done.
  const stages = games.map((game) => Math.min(levelOf(levels, game) + 1, 3));
  for (const pack of unlockedPacks(stages)) {
    const p = packProgress(pack, regular);
    if (p.complete) list.push({ key: `pack-${pack.id}`, line: (name) => `${name}, you collected the whole ${pack.name} pack!` });
    if (p.sparklyComplete) list.push({ key: `sparkly-${pack.id}`, line: (name) => `Every sparkly ${pack.name} sticker! Amazing, ${name}!` });
  }
  for (const game of games) {
    const level = levels[game.id] ?? 0;
    if (level >= 2) list.push({ key: `${game.id}-lv3`, line: (name) => `${name} reached level 3 in ${game.name}!` });
    if (level >= 4) list.push({ key: `${game.id}-lv5`, line: (name) => `Level 5 in ${game.name}! You're a superstar, ${name}!` });
    if (mastered(rounds, game)) list.push({ key: `${game.id}-gold`, line: (name) => `Gold star, ${name}! You have mastered ${game.name}!` });
  }
  return list;
}

export const specialCount = (records: readonly StickerLike[]) => records.filter((r) => isSpecial(r.sticker)).length;

/** The oldest milestone still owed a special sticker, or null when Nova has nothing to hand out. */
export function pendingMilestone(records: readonly StickerLike[], levels: Levels, games: readonly Game[], rounds: readonly RoundRecord[] = []): Milestone | null {
  const reached = milestonesReached(records, levels, games, rounds);
  const owed = reached.length - specialCount(records);
  return owed > 0 ? reached[reached.length - owed] : null;
}

/** A special sticker not owned yet; once all are owned, a sparkly copy. */
export function drawSpecial(records: readonly StickerLike[], rng: () => number = Math.random) {
  const owned = collected(records);
  const fresh = SPECIAL_PACK.stickers.filter((s) => !owned.has(s.id));
  const pool = fresh.length ? fresh : SPECIAL_PACK.stickers;
  return { sticker: pool[Math.floor(rng() * pool.length)], sparkly: fresh.length === 0 };
}
