import type { Child } from '@/features/children/model';
import { isGameId } from '@/features/games/catalog';
import { readJSON } from '@/shared/utils/storage';
import { emptyProgress, type Change, type Progress } from './model';
import { cacheKey } from './repo';

/**
 * Guest mode saves everything on the device (see app/App.tsx). Once a parent signs in, that play history
 * can be copied onto one of their children: the records keep their ids, so an import is idempotent and a
 * repeat adds nothing.
 *
 * There is deliberately no "already imported" flag. There used to be one, written the moment the button
 * was tapped — so an import that never actually reached the server still hid the offer for good, and the
 * play looked lost. Whether there is anything to bring across is now answered by comparing the records
 * themselves, which self-heals: once it really has been imported there is nothing left to import.
 */
export const GUEST_CHILDREN = 'maths-garden:guest-children';
export const GUEST_OUTBOX = 'maths-garden:guest-outbox';
export const GUEST_ACTIVE = 'maths-garden:guest-active-child';
export const GUEST_FLAG = 'maths-garden:guest';

export interface GuestProfile {
  child: Child;
  progress: Progress;
  /** Rounds played (including any left early), stickers collected and distinct days, for the panel. */
  rounds: number;
  stickers: number;
  days: number;
  lastPlayed: string | null;
}

const summarise = (child: Child, progress: Progress): GuestProfile => ({
  child,
  progress,
  rounds: progress.rounds.length,
  stickers: progress.stickers.length,
  days: new Set(progress.rounds.map((r) => r.playedAt.slice(0, 10))).size,
  lastPlayed: progress.rounds.reduce<string | null>((latest, r) => (latest === null || r.playedAt > latest ? r.playedAt : latest), null),
});

/** Every guest profile on this device that has something worth keeping. */
export function guestProfiles(): GuestProfile[] {
  return readJSON<Child[]>(GUEST_CHILDREN, [])
    .map((child) => summarise(child, { ...emptyProgress(), ...readJSON<Partial<Progress>>(cacheKey(child.id), {}) }))
    .filter((p) => p.rounds > 0 || p.stickers > 0);
}

/** The writes that copy a guest history onto an account child: anything the child doesn't already have, and any higher level. */
export function importChanges(guest: Progress, target: Progress, childId: string): Change[] {
  const changes: Change[] = [];
  const missing = (list: readonly { id: string }[], id: string) => !list.some((x) => x.id === id);

  for (const round of guest.rounds) if (missing(target.rounds, round.id)) changes.push({ kind: 'round', round: { ...round, childId } });
  for (const [game, level] of Object.entries(guest.levels)) {
    if (!isGameId(game) || level === undefined) continue;
    if (level > (target.levels[game] ?? 0)) changes.push({ kind: 'level', childId, game, level });
  }
  for (const checkin of guest.checkins) if (missing(target.checkins, checkin.id)) changes.push({ kind: 'checkin', checkin: { ...checkin, childId } });
  for (const sticker of guest.stickers) if (missing(target.stickers, sticker.id)) changes.push({ kind: 'sticker', sticker: { ...sticker, childId } });
  return changes;
}

/** Guest profiles that still have something this child hasn't got. Empty once it has all landed. */
export const guestProfilesToImport = (target: Progress, childId: string): GuestProfile[] =>
  guestProfiles().filter((profile) => importChanges(profile.progress, target, childId).length > 0);
