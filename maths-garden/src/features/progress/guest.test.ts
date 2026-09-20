import { beforeEach, describe, expect, it } from 'vitest';
import type { RoundRecord } from '@/features/games/engine';
import { writeJSON } from '@/shared/utils/storage';
import { guestProfiles, guestProfilesToImport, GUEST_CHILDREN, importChanges } from './guest';
import { applyChange, emptyProgress, type Change, type Progress, type StickerRecord } from './model';
import { cacheKey } from './repo';

/** Only the level writes, typed as such. */
const levelsOf = (changes: Change[]) => changes.flatMap((c) => (c.kind === 'level' ? [c] : []));

const round = (id: string, childId: string, playedAt: string): RoundRecord => ({
  id,
  childId,
  game: 'peek',
  level: 1,
  score: 5,
  total: 5,
  answers: [{ target: '3', chosen: '3', correct: true, ms: 1800 }],
  playedAt,
});

const sticker = (id: string, childId: string): StickerRecord => ({ id, childId, sticker: 'unicorn/rainbow', shiny: true, roundId: null, earnedAt: '2026-09-11T17:00:00Z' });

const guestProgress = (): Progress => ({
  ...emptyProgress(),
  rounds: [round('r1', 'guest-1', '2026-09-10T17:00:00Z'), round('r2', 'guest-1', '2026-09-11T17:30:00Z')],
  levels: { peek: 2, count: 1 },
  stickers: [sticker('s1', 'guest-1')],
});

describe('guest import', () => {
  beforeEach(() => localStorage.clear());

  it('lists guest profiles with something saved', () => {
    writeJSON(GUEST_CHILDREN, [
      { id: 'guest-1', name: 'Tara', birthdate: null, avatar: '🦄' },
      { id: 'guest-2', name: 'Nobody', birthdate: null, avatar: '🌸' },
    ]);
    writeJSON(cacheKey('guest-1'), guestProgress());

    const [only, ...rest] = guestProfiles();
    expect(rest).toEqual([]);
    expect(only.child.name).toBe('Tara');
    expect(only).toMatchObject({ rounds: 2, stickers: 1, days: 2, lastPlayed: '2026-09-11T17:30:00Z' });
  });

  it('offers a profile until its records are actually on the child, then stops', () => {
    writeJSON(GUEST_CHILDREN, [{ id: 'guest-1', name: 'Tara', birthdate: null, avatar: '🦄' }]);
    writeJSON(cacheKey('guest-1'), guestProgress());

    // Nothing imported yet: offered.
    expect(guestProfilesToImport(emptyProgress(), 'tara')).toHaveLength(1);

    // Once every record is on the child there is nothing left to bring across, so the offer goes by itself.
    const imported = importChanges(guestProgress(), emptyProgress(), 'tara').reduce(applyChange, emptyProgress());
    expect(guestProfilesToImport(imported, 'tara')).toEqual([]);

    // A half-finished import keeps being offered — which a flag written on tap could never do.
    const partial = importChanges(guestProgress(), emptyProgress(), 'tara').slice(0, 1).reduce(applyChange, emptyProgress());
    expect(guestProfilesToImport(partial, 'tara')).toHaveLength(1);
  });

  it('re-keys rounds, stickers and levels onto the account child, recording each raised level as an import', () => {
    const changes = importChanges(guestProgress(), emptyProgress(), 'tara');
    const merged = changes.reduce(applyChange, emptyProgress());
    expect(merged.rounds.map((r) => r.childId)).toEqual(['tara', 'tara']);
    expect(merged.stickers.map((s) => s.childId)).toEqual(['tara']);
    expect(merged.levels).toEqual({ peek: 2, count: 1 });

    // The jump is a level event like any other, so the Progress screen and the Analyst can tell it from live play.
    expect(levelsOf(changes).map((c) => c.event)).toEqual([
      expect.objectContaining({ childId: 'tara', game: 'peek', from: 0, to: 2, reason: 'import' }),
      expect.objectContaining({ childId: 'tara', game: 'count', from: 0, to: 1, reason: 'import' }),
    ]);
    expect(merged.levelEvents).toHaveLength(2);
    expect(merged.levelEvents.every((e) => e.reason === 'import')).toBe(true);
  });

  it('keeps the account level when it is already higher, and imports nothing twice', () => {
    const guest = guestProgress();
    const changes = importChanges(guest, { ...emptyProgress(), levels: { peek: 4 } }, 'tara');
    expect(levelsOf(changes).map((c) => c.event)).toEqual([expect.objectContaining({ game: 'count', from: 0, to: 1, reason: 'import' })]);

    const target = changes.reduce(applyChange, { ...emptyProgress(), levels: { peek: 4 } });
    expect(target.levels.peek).toBe(4);
    expect(target.levelEvents.map((e) => [e.game, e.reason])).toEqual([['count', 'import']]);
    expect(importChanges(guest, target, 'tara')).toEqual([]);
  });

  it('carries the steps the guest earned on the way, in order and before the import, so the timeline is not flat', () => {
    const guest: Progress = {
      ...guestProgress(),
      levelEvents: [
        { id: 'e2', childId: 'guest-1', game: 'peek', from: 1, to: 2, reason: 'earned', at: '2026-09-11T17:40:00Z' },
        { id: 'e1', childId: 'guest-1', game: 'peek', from: 0, to: 1, reason: 'earned', at: '2026-09-10T17:10:00Z' },
      ],
    };
    const changes = importChanges(guest, emptyProgress(), 'tara');
    const peek = levelsOf(changes).filter((c) => c.game === 'peek');
    expect(peek.map((c) => [c.level, c.event?.id, c.event?.childId, c.event?.reason])).toEqual([
      [1, 'e1', 'tara', 'earned'],
      [2, 'e2', 'tara', 'earned'],
      [2, expect.any(String), 'tara', 'import'],
    ]);
    // The import starts where the earned steps ended, so the two steps are not counted a second time as one jump.
    expect(peek.map((c) => [c.event?.from, c.event?.to])).toEqual([
      [0, 1],
      [1, 2],
      [2, 2],
    ]);

    // Ids are kept, so a second import adds nothing — and the account ends where the guest was.
    const merged = changes.reduce(applyChange, emptyProgress());
    expect(merged.levels.peek).toBe(2);
    expect(merged.levelEvents.filter((e) => e.game === 'peek')).toHaveLength(3);
    expect(importChanges(guest, merged, 'tara')).toEqual([]);
  });
});
