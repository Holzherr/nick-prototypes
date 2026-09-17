import { useSyncExternalStore } from 'react';
import { track } from '@/features/analytics/events';
import type { Child } from '@/features/children/model';
import { GUEST_ACTIVE, GUEST_CHILDREN, GUEST_FLAG } from '@/features/progress/guest';
import { readJSON, writeJSON } from '@/shared/utils/storage';
import { applyTheme, DEFAULT_THEME, themeById, type ThemeId } from './themes';

/**
 * The name and icon a visitor sets on the homepage, and the shortcut from there straight into play.
 *
 * The old front door asked for an email before a child could count to five: homepage → "Start free" →
 * sign-in card → create a profile → pick an avatar → play. Guest mode was the last item on the card.
 * Twenty visits on the day this was written produced two people who found it. Typing a name on the
 * homepage does the same thing in one step, and the account can come later — GardenApp already offers
 * to carry the play across when a parent signs in, so nothing typed here is stranded.
 */
const THEME_KEY = 'maths-garden:theme';
const NAME_KEY = 'maths-garden:player-name';

export const readTheme = (): ThemeId => themeById(readJSON<string | null>(THEME_KEY, null)).id;
export const readName = (): string => readJSON<string>(NAME_KEY, '');

/**
 * Everything that draws the theme rather than reading it through a colour token — the logo's glyph, the
 * shapes drifting in the background — has to re-render when the choice changes. The palette itself does
 * not: it lives in custom properties, so the repaint is the browser's.
 */
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function writeTheme(id: ThemeId) {
  writeJSON(THEME_KEY, id);
  applyTheme(id);
  current = id;
  for (const fn of listeners) fn();
}

// useSyncExternalStore compares by identity, so the snapshot has to be a cached value and not a fresh read.
let current: ThemeId | null = null;
const snapshot = (): ThemeId => (current ??= readTheme());

/** The live theme, for the handful of components that draw it directly. */
export const useTheme = (): ThemeId => useSyncExternalStore(subscribe, snapshot, () => DEFAULT_THEME);

/** Longest name that still fits the homepage heading and a printable's corner. */
export const NAME_MAX = 16;

/** Trim, collapse runs of spaces, and cap — a name goes into a heading and onto printed sheets. */
export const cleanName = (raw: string) => raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);

/**
 * Remember this player and open their garden.
 *
 * Writes the same guest records the profile screen writes, so this is a shortcut through the existing
 * flow rather than a second way to be a child: one `Child` in guest storage, marked active, guest flag on.
 */
export function startPlaying(rawName: string, theme: ThemeId): Child | null {
  const name = cleanName(rawName);
  if (!name) return null;

  // Counted before the flag goes on: guest mode records nothing at all, by promise, so once the flag is
  // written this visit disappears from the numbers entirely.
  track('guest_start');

  const child: Child = { id: crypto.randomUUID(), name, birthdate: null, avatar: themeById(theme).glyph };
  writeJSON(NAME_KEY, name);
  writeTheme(theme);
  writeJSON(GUEST_CHILDREN, [...readJSON<Child[]>(GUEST_CHILDREN, []), child]);
  writeJSON(GUEST_ACTIVE, child.id);
  writeJSON(GUEST_FLAG, true);
  return child;
}

/** Restore the saved theme on boot, before the first paint has anything to repaint. */
export function bootTheme() {
  applyTheme(readTheme());
}

export { DEFAULT_THEME };
