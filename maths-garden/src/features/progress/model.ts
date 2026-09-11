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

/** Everything saved for one child. */
export interface Progress {
  rounds: RoundRecord[];
  levels: Levels;
  checkins: CheckinRecord[];
  stickers: StickerRecord[];
}

export const emptyProgress = (): Progress => ({ rounds: [], levels: {}, checkins: [], stickers: [] });

/** A write, applied locally at once and queued for the server. */
export type Change =
  | { kind: 'round'; round: RoundRecord }
  | { kind: 'level'; childId: string; game: GameId; level: number }
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
      return { ...progress, levels: { ...progress.levels, [change.game]: change.level } };
    case 'checkin':
      return { ...progress, checkins: addOnce(progress.checkins, change.checkin) };
    case 'sticker':
      return { ...progress, stickers: addOnce(progress.stickers, change.sticker) };
  }
}

/** The server rejected the write itself (bad data, not allowed). Retrying won't help, so it is dropped. */
export class PermanentError extends Error {}

export interface Remote {
  fetch(childId: string): Promise<Progress>;
  push(change: Change): Promise<void>;
}
