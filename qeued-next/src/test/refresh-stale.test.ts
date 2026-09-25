import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error the catalogue tools are plain .mjs with no declaration file
import { isStale, refresh, staleTitles } from '../../tools/refresh-stale.mjs';

const now = new Date('2026-10-12T00:00:00Z');
const expiring = (days: number) => ({ expires_at: new Date(now.getTime() + days * 86_400_000).toISOString() });

describe('stale predicate', () => {
  it('selects a title past its expiry or never checked, not one still inside it', () => {
    expect(isStale([expiring(3)], now)).toBe(false);
    expect(isStale([expiring(-1)], now)).toBe(true);
    expect(isStale([], now)).toBe(true);
    // The newest row decides: an old expired row beside a live one is not stale.
    expect(isStale([expiring(-40), expiring(20)], now)).toBe(false);
    const titles = [
      { slug: 'live', title_availability: [expiring(3)] },
      { slug: 'expired', title_availability: [expiring(-1)] },
      { slug: 'never' },
    ];
    expect(staleTitles(titles, now).map((t: { slug: string }) => t.slug)).toEqual(['expired', 'never']);
  });
});

describe('refresh', () => {
  it('returns before any read or write when nothing is stale', async () => {
    const steps = { gather: vi.fn(), sql: vi.fn(), apply: vi.fn() };
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(await refresh([], steps)).toEqual({ revisited: 0, offers: 0 });
    expect(steps.gather).not.toHaveBeenCalled();
    expect(steps.sql).not.toHaveBeenCalled();
    expect(steps.apply).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('0 title(s) stale; nothing revisited.');
    log.mockRestore();
  });
});
