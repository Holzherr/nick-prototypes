import { applyChange, childOf, emptyProgress, PermanentError, type Change, type Progress, type Remote } from './model';

type KeyValue = Pick<Storage, 'getItem' | 'setItem'>;

const DEFAULT_OUTBOX = 'maths-garden:outbox';
export const cacheKey = (childId: string) => `maths-garden:progress:${childId}`;

export interface ProgressRepo {
  /** What this device last saw for the child; instant, works offline. */
  cached(childId: string): Progress;
  /** Uploads anything queued, then fetches from the server (falls back to the cache). */
  load(childId: string): Promise<Progress>;
  /** Saves locally, queues, and tries to upload. Never throws. */
  apply(change: Change): Promise<void>;
  /** Changes still waiting to upload. */
  pending(): number;
}

/**
 * Offline-first progress store: a per-child cache plus one outbox in local storage. The iPad can
 * lose signal mid-game; nothing is lost, it uploads on the next save or app start.
 */
export function createRepo(remote: Remote, storage: KeyValue, OUTBOX = DEFAULT_OUTBOX): ProgressRepo {
  const read = <T>(key: string, fallback: T): T => {
    try {
      const raw = storage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  };
  const write = (key: string, value: unknown) => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or blocked; the server copy still gets the write
    }
  };

  const outbox = () => read<Change[]>(OUTBOX, []);
  const cached = (childId: string): Progress => ({ ...emptyProgress(), ...read<Partial<Progress>>(cacheKey(childId), {}) });

  let flushing: Promise<void> | null = null;
  const flush = () => {
    flushing ??= (async () => {
      while (outbox().length) {
        try {
          await remote.push(outbox()[0]);
        } catch (err) {
          if (!(err instanceof PermanentError)) return; // offline or session expired: try again later
          console.warn('maths-garden: dropped a change the server rejected', err);
        }
        // Appends only ever go to the end, so the head is still the change just sent.
        write(OUTBOX, outbox().slice(1));
      }
    })().finally(() => {
      flushing = null;
    });
    return flushing;
  };

  return {
    cached,
    pending: () => outbox().length,
    async load(childId) {
      await flush();
      try {
        const fresh = await remote.fetch(childId);
        const merged = outbox()
          .filter((c) => childOf(c) === childId)
          .reduce(applyChange, fresh);
        write(cacheKey(childId), merged);
        return merged;
      } catch {
        return cached(childId);
      }
    },
    async apply(change) {
      const childId = childOf(change);
      write(cacheKey(childId), applyChange(cached(childId), change));
      write(OUTBOX, [...outbox(), change]);
      await flush();
    },
  };
}
