import { describe, expect, it } from 'vitest';
import { MAX_SENDS, nextSends, WINDOW_MS } from '../../../supabase/functions/send-report/cap';

const NOW = Date.parse('2026-10-11T20:00:00Z');

describe('send-report daily cap', () => {
  it('lets a first report go and remembers when', () => {
    expect(nextSends(undefined, NOW)).toEqual([NOW]);
  });

  it('refuses one more once an account has had its reports for the day', () => {
    const full = Array.from({ length: MAX_SENDS }, (_, i) => NOW - i * 60_000);
    expect(nextSends(full, NOW)).toBeNull();
  });

  it('forgets sends older than a day, and anything that is not a time', () => {
    const old = Array.from({ length: MAX_SENDS }, (_, i) => NOW - WINDOW_MS - i);
    expect(nextSends([...old, 'x', null, NOW + 1], NOW)).toEqual([NOW]);
  });
});
