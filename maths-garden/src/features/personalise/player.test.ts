import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Child } from '@/features/children/model';
import { GUEST_ACTIVE, GUEST_CHILDREN, GUEST_FLAG } from '@/features/progress/guest';
import { readJSON } from '@/shared/utils/storage';
import { cleanName, NAME_MAX, readTheme, startPlaying, writeTheme } from './player';
import { applyTheme, themeById } from './themes';

const track = vi.fn();
vi.mock('@/features/analytics/events', () => ({ track: (...args: unknown[]) => track(...args) }));

describe('the name typed on the homepage', () => {
  it('collapses whitespace and caps the length, because it lands in a heading and on printed sheets', () => {
    expect(cleanName('  Tara  ')).toBe('Tara');
    expect(cleanName('Anna   Maria')).toBe('Anna Maria');
    expect(cleanName('x'.repeat(40))).toHaveLength(NAME_MAX);
  });

  it('is nothing when it is only spaces', () => {
    expect(cleanName('   ')).toBe('');
  });
});

describe('starting play from the homepage', () => {
  beforeEach(() => {
    localStorage.clear();
    track.mockClear();
  });

  it('writes the same guest records the profile screen writes, so it is one flow and not two', () => {
    const child = startPlaying('  Ravi ', 'rocket');

    expect(child).not.toBeNull();
    expect(readJSON<Child[]>(GUEST_CHILDREN, [])).toHaveLength(1);
    expect(readJSON<Child[]>(GUEST_CHILDREN, [])[0]).toMatchObject({ name: 'Ravi', avatar: themeById('rocket').glyph, birthdate: null });
    expect(readJSON(GUEST_ACTIVE, null)).toBe(child!.id);
    expect(readJSON(GUEST_FLAG, false)).toBe(true);
  });

  it('keeps a child already on the device rather than replacing them', () => {
    startPlaying('Ravi', 'rocket');
    startPlaying('Mia', 'dragon');
    expect(readJSON<Child[]>(GUEST_CHILDREN, []).map((c) => c.name)).toEqual(['Ravi', 'Mia']);
  });

  it('counts the start before the guest flag goes on, because nothing is recorded afterwards', () => {
    const order: string[] = [];
    track.mockImplementation((name: string) => order.push(`track:${name}`));
    const realSet = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === GUEST_FLAG) order.push('flag');
      return realSet.call(this, key, value);
    });

    startPlaying('Mia', 'cat');

    expect(order.indexOf('track:guest_start')).toBeLessThan(order.indexOf('flag'));
    vi.restoreAllMocks();
  });

  it('refuses a blank name instead of creating a nameless child', () => {
    expect(startPlaying('   ', 'unicorn')).toBeNull();
    expect(readJSON<Child[]>(GUEST_CHILDREN, [])).toHaveLength(0);
    expect(readJSON(GUEST_FLAG, false)).toBe(false);
    expect(track).not.toHaveBeenCalled();
  });
});

describe('the chosen icon', () => {
  beforeEach(() => localStorage.clear());

  it('falls back to the plain one when storage holds something unknown', () => {
    localStorage.setItem('maths-garden:theme', JSON.stringify('wizard'));
    expect(readTheme()).toBe('plain');
  });

  it('survives a reload', () => {
    writeTheme('dragon');
    expect(readTheme()).toBe('dragon');
  });

  it('repaints by rewriting the palette custom properties every component already reads', () => {
    const root = document.createElement('html');
    applyTheme('car', root);
    expect(root.style.getPropertyValue('--color-raspberry')).toBe(themeById('car').colors.raspberry);
    expect(root.dataset.theme).toBe('car');
  });
});
