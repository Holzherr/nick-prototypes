import { describe, expect, it } from 'vitest';
import { STATUS_ORDER, feedVerb, formatRating, sortEntries, statusLabel } from './model';

describe('library model', () => {
  it('labels every status', () => {
    for (const s of STATUS_ORDER) expect(statusLabel(s)).toMatch(/\w/);
    expect(statusLabel('want_to_watch')).toBe('Want to Watch');
    expect(STATUS_ORDER).toEqual(['watched', 'watching', 'want_to_watch', 'dropped']);
  });

  it('phrases the following feed', () => {
    expect(feedVerb('want_to_watch')).toBe('wants to watch');
    expect(feedVerb('watching')).toBe('is watching');
    expect(feedVerb('watched')).toBe('watched');
    expect(feedVerb('dropped')).toBe('dropped');
  });

  it('formats ratings', () => {
    expect(formatRating(8.14)).toBe('8.1');
    expect(formatRating(9)).toBe('9.0');
    expect(formatRating(null)).toBe('—');
    expect(formatRating(undefined)).toBe('—');
  });

  it('sorts the want-to-watch list by desire ranking, unranked last, and leaves other lists alone', () => {
    const a = { id: 'a', desire_ranking: 2 };
    const b = { id: 'b', desire_ranking: null };
    const c = { id: 'c', desire_ranking: 1 };
    expect(sortEntries([a, b, c], 'want_to_watch').map((e) => e.id)).toEqual(['c', 'a', 'b']);
    expect(sortEntries([a, b, c], 'watched').map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });
});
