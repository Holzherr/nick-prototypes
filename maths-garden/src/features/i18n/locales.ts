/**
 * The languages the app speaks.
 *
 * Chosen for who actually arrives: Polish, Urdu-adjacent Hindi and Arabic are among the most spoken
 * languages other than English in England and Wales, and the rest are the large European ones a link
 * shared online lands in front of. `dir` matters — Arabic lays the whole app out right to left.
 */
export interface Locale {
  code: LocaleCode;
  /** What the language calls itself, which is what a speaker of it recognises in a menu. */
  endonym: string;
  /** What it is called in English, for the aria-label. */
  english: string;
  dir: 'ltr' | 'rtl';
}

export const LOCALES = [
  { code: 'en', endonym: 'English', english: 'English', dir: 'ltr' },
  { code: 'es', endonym: 'Español', english: 'Spanish', dir: 'ltr' },
  { code: 'fr', endonym: 'Français', english: 'French', dir: 'ltr' },
  { code: 'de', endonym: 'Deutsch', english: 'German', dir: 'ltr' },
  { code: 'pl', endonym: 'Polski', english: 'Polish', dir: 'ltr' },
  { code: 'pt', endonym: 'Português', english: 'Portuguese', dir: 'ltr' },
  { code: 'it', endonym: 'Italiano', english: 'Italian', dir: 'ltr' },
  { code: 'nl', endonym: 'Nederlands', english: 'Dutch', dir: 'ltr' },
  { code: 'sv', endonym: 'Svenska', english: 'Swedish', dir: 'ltr' },
  { code: 'hi', endonym: 'हिन्दी', english: 'Hindi', dir: 'ltr' },
  { code: 'ar', endonym: 'العربية', english: 'Arabic', dir: 'rtl' },
] as const satisfies readonly Locale[];

export type LocaleCode = 'en' | 'es' | 'fr' | 'de' | 'pl' | 'pt' | 'it' | 'nl' | 'sv' | 'hi' | 'ar';

export const DEFAULT_LOCALE: LocaleCode = 'en';

const CODES = new Set(LOCALES.map((l) => l.code as string));

export const isLocale = (value: unknown): value is LocaleCode => typeof value === 'string' && CODES.has(value);

export const localeByCode = (code: string | null | undefined): Locale => LOCALES.find((l) => l.code === code) ?? LOCALES[0];

/**
 * The best supported language for this visitor, from the languages they actually set on the device.
 *
 * Deliberately not geolocation. An IP says where the router is, not what the family reads: a Polish
 * household in London looks English, and a British family on holiday in Lisbon looks Portuguese. It would
 * also mean asking a third party about every visitor's address, on a site whose homepage promises no
 * third parties. `navigator.languages` is the parent's own setting, needs no network, and is already
 * ordered by their preference.
 *
 * Region tags are matched loosely: pt-BR and pt-PT both get Portuguese, which is better than English.
 */
export function detectLocale(preferred: readonly string[] = navigator.languages ?? [navigator.language]): LocaleCode {
  for (const tag of preferred) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
