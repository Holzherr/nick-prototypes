import { beforeEach, describe, expect, it } from 'vitest';
import type { RoundRecord } from '@/features/games/engine';
import { writeJSON } from '@/shared/utils/storage';
import { guestProfiles, GUEST_CHILDREN, importChanges, markImported } from './guest';
import { applyChange, emptyProgress, type Progress, type StickerRecord } from './model';
import { cacheKey } from './repo';

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
  rounds: [round('r1', 'guest-1', '2026-09-10T17:00:00Z'), round('r2', 'guest-1', '2026-09-11T17:30:00Z')],
  levels: { peek: 2, count: 1 },
  checkins: [],
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

  it('stops offering a profile once it has been imported', () => {
    writeJSON(GUEST_CHILDREN, [{ id: 'guest-1', name: 'Tara', birthdate: null, avatar: '🦄' }]);
    writeJSON(cacheKey('guest-1'), guestProgress());
    markImported('guest-1');
    expect(guestProfiles()).toEqual([]);
  });

  it('re-keys rounds, stickers and levels onto the account child', () => {
    const changes = importChanges(guestProgress(), emptyProgress(), 'tara');
    const merged = changes.reduce(applyChange, emptyProgress());
    expect(merged.rounds.map((r) => r.childId)).toEqual(['tara', 'tara']);
    expect(merged.stickers.map((s) => s.childId)).toEqual(['tara']);
    expect(merged.levels).toEqual({ peek: 2, count: 1 });
  });

  it('keeps the account level when it is already higher, and imports nothing twice', () => {
    const guest = guestProgress();
    const target = importChanges(guest, { ...emptyProgress(), levels: { peek: 4 } }, 'tara').reduce(applyChange, { ...emptyProgress(), levels: { peek: 4 } });
    expect(target.levels.peek).toBe(4);
    expect(importChanges(guest, target, 'tara')).toEqual([]);
  });
});
