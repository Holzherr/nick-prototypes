import { afterEach, describe, expect, it, vi } from 'vitest';
import { CACHE_KEY, CACHE_TTL, readSlate, writeSlate } from './slateCache';
import type { TonightResult } from './TonightScreen';

const slate = (title: string): TonightResult => ({
  picks: [{ title, type: 'movie', year: 2020, genres: [], imdb_rating: 7, explanation: 'x', pick_type: 'best', in_queue: true, providers: [] }],
  queue_size: 1,
  ranked_queue: [{ title, score: 70, explanation: 'x' }],
});
const KEY = 'p1|easy|short';

describe('slateCache', () => {
  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('misses before anything is written, hits the same key after, misses other profiles and filters', () => {
    expect(readSlate(KEY)).toBeNull();
    writeSlate(KEY, slate('A'));
    writeSlate('p1|funny|short', slate('B'));
    expect(readSlate(KEY)?.picks[0].title).toBe('A');
    for (const other of ['p2|easy|short', 'p1|easy|long', 'p1|intense|short']) expect(readSlate(other)).toBeNull();
  });

  it('treats an entry past 24h, malformed JSON or the wrong shape as a miss and drops it', () => {
    vi.useFakeTimers();
    writeSlate(KEY, slate('A'));
    vi.advanceTimersByTime(CACHE_TTL + 1);
    const stale = localStorage.getItem(CACHE_KEY)!;
    for (const raw of [stale, '{not json', JSON.stringify({ [KEY]: { result: { picks: 'no' }, timestamp: Date.now() } })]) {
      localStorage.setItem(CACHE_KEY, raw);
      expect(readSlate(KEY)).toBeNull();
      expect(localStorage.getItem(CACHE_KEY)).toBe('{}');
    }
  });
});
