import type { TonightResult } from './TonightScreen';

/**
 * Model-scored slates, kept on the device for a day under one localStorage key: a map from
 * `${profileId}|${mood}|${length}` to what the model returned, so the next visit paints that
 * instead of the fast slate. Anything malformed or stale reads as a miss and is dropped.
 */
export const CACHE_KEY = 'qeued_tonight_cache';
export const CACHE_TTL = 24 * 60 * 60 * 1000;

type Stored = Record<string, { result: TonightResult; timestamp: number }>;

const load = (): Stored => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') as Record<string, Partial<Stored[string]> | null>;
    const live: Stored = {};
    for (const [key, e] of Object.entries(parsed)) {
      if (e && typeof e.timestamp === 'number' && Date.now() - e.timestamp <= CACHE_TTL && Array.isArray(e.result?.picks) && Array.isArray(e.result.ranked_queue))
        live[key] = { result: e.result, timestamp: e.timestamp };
    }
    return live;
  } catch {
    return {};
  }
};

const save = (stored: Stored): Stored => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(stored));
  } catch {}
  return stored;
};

export const readSlate = (key: string): TonightResult | null => save(load())[key]?.result ?? null;

export const writeSlate = (key: string, result: TonightResult) => save({ ...load(), [key]: { result, timestamp: Date.now() } });
