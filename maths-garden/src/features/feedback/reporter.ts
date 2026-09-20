import { readJSON, writeJSON } from '@/shared/utils/storage';

/**
 * Who is typing, remembered on the device.
 *
 * Three fixed names and no free text: the point is that the Analyst can group notes by who wrote them, and
 * a name typed three different ways is three reporters. The choice is stored in localStorage so a phone
 * that is always Priyanka's does not ask again. Anything else found in storage — an old value, a hand edit —
 * reads back as "not chosen" rather than being sent.
 */
export const REPORTERS = ['Nick', 'Priyanka', 'Tara'] as const;
export type Reporter = (typeof REPORTERS)[number];

export const KINDS = [
  { id: 'bug', label: 'Bug' },
  { id: 'idea', label: 'Idea' },
  { id: 'tara-noticed', label: 'Tara noticed' },
] as const;
export type Kind = (typeof KINDS)[number]['id'];

const REPORTER_KEY = 'maths-garden:feedback-reporter';

export const isReporter = (value: unknown): value is Reporter => REPORTERS.includes(value as Reporter);
export const isKind = (value: unknown): value is Kind => KINDS.some((k) => k.id === value);

/** The remembered reporter, or null when none was chosen or storage holds something unknown. */
export function readReporter(): Reporter | null {
  const value = readJSON<unknown>(REPORTER_KEY, null);
  return isReporter(value) ? value : null;
}

/** Remember the choice; null forgets it. */
export function writeReporter(reporter: Reporter | null) {
  writeJSON(REPORTER_KEY, reporter);
}
