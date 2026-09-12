import type { GameId } from '@/features/games/catalog';
import type { Levels, RoundRecord } from '@/features/games/engine';
import type { ProbeId } from './probes';

export interface CheckinRecord {
  id: string;
  childId: string;
  probe: ProbeId;
  score: number;
  max: number | null;
  note: string | null;
  /** yyyy-mm-dd */
  takenOn: string;
}

export interface StickerRecord {
  id: string;
  childId: string;
  /** Sticker id from features/stickers/catalog ("unicorn/rainbow"). */
  sticker: string;
  /** Earned with a perfect round. */
  shiny: boolean;
  roundId: string | null;
  earnedAt: string;
}

/** Why a level changed: the rule, two poor rounds, a grown-up, or guest progress being brought in. */
export type LevelReason = 'earned' | 'dropped' | 'manual' | 'import';

/**
 * One level change. `maths_levels` only keeps where a child is now, so without these the history had to be
 * guessed from the level of the next round — which misses changes with no round after them and cannot tell
 * an earned move from an override.
 */
export interface LevelEvent {
  id: string;
  childId: string;
  game: GameId;
  from: number;
  to: number;
  reason: LevelReason;
  at: string;
}

/** Everything saved for one child. */
export interface Progress {
  rounds: RoundRecord[];
  levels: Levels;
  levelEvents: LevelEvent[];
  checkins: CheckinRecord[];
  stickers: StickerRecord[];
}

export const emptyProgress = (): Progress => ({ rounds: [], levels: {}, levelEvents: [], checkins: [], stickers: [] });

/** A write, applied locally at once and queued for the server. */
export type Change =
  | { kind: 'round'; round: RoundRecord }
  | { kind: 'level'; childId: string; game: GameId; level: number; event?: LevelEvent }
  | { kind: 'checkin'; checkin: CheckinRecord }
  | { kind: 'sticker'; sticker: StickerRecord };

export function childOf(change: Change): string {
  switch (change.kind) {
    case 'round':
      return change.round.childId;
    case 'level':
      return change.childId;
    case 'checkin':
      return change.checkin.childId;
    case 'sticker':
      return change.sticker.childId;
  }
}

const addOnce = <T extends { id: string }>(list: T[], item: T) => (list.some((x) => x.id === item.id) ? list : [...list, item]);

export function applyChange(progress: Progress, change: Change): Progress {
  switch (change.kind) {
    case 'round':
      return { ...progress, rounds: addOnce(progress.rounds, change.round) };
    case 'level':
      return {
        ...progress,
        levels: { ...progress.levels, [change.game]: change.level },
        levelEvents: change.event ? addOnce(progress.levelEvents, change.event) : progress.levelEvents,
      };
    case 'checkin':
      return { ...progress, checkins: addOnce(progress.checkins, change.checkin) };
    case 'sticker':
      return { ...progress, stickers: addOnce(progress.stickers, change.sticker) };
  }
}

/** Make the level change and the event that records it, in one place. */
export const levelChange = (childId: string, game: GameId, from: number, to: number, reason: LevelReason, at = new Date().toISOString()): Change => ({
  kind: 'level',
  childId,
  game,
  level: to,
  event: { id: crypto.randomUUID(), childId, game, from, to, reason, at },
});

/** The server rejected the write itself (bad data, not allowed). Retrying won't help, so it is dropped. */
export class PermanentError extends Error {}

export interface Remote {
  fetch(childId: string): Promise<Progress>;
  push(change: Change): Promise<void>;
}
