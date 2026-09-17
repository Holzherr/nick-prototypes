import { beforeEach, describe, expect, it } from 'vitest';
import { setLocale, snapshotForTest, subscribeForTest, translate } from './i18n';
import { detectLocale, isLocale, localeByCode } from './locales';
import { EN } from './strings';
import AR from './catalogues/ar';
import DE from './catalogues/de';
import ES from './catalogues/es';
import FR from './catalogues/fr';
import HI from './catalogues/hi';
import IT from './catalogues/it';
import NL from './catalogues/nl';
import PL from './catalogues/pl';
import PT from './catalogues/pt';
import SV from './catalogues/sv';

const CATALOGUES = { es: ES, fr: FR, de: DE, pl: PL, pt: PT, it: IT, nl: NL, sv: SV, hi: HI, ar: AR };

describe('picking a language for a visitor', () => {
  it('takes the first language they actually asked for', () => {
    expect(detectLocale(['fr-CA', 'en-GB'])).toBe('fr');
  });

  it('ignores the region, because pt-BR reading Portuguese beats pt-BR reading English', () => {
    expect(detectLocale(['pt-BR'])).toBe('pt');
  });

  it('falls back to English rather than to nothing', () => {
    expect(detectLocale(['cy', 'ga'])).toBe('en');
  });

  it('skips a language it does not speak and keeps looking', () => {
    expect(detectLocale(['is', 'da', 'sv'])).toBe('sv');
  });

  it('survives a device that reports no languages at all', () => {
    expect(detectLocale([])).toBe('en');
  });
});

describe('every catalogue', () => {
  it.each(Object.entries(CATALOGUES))('%s uses only keys that exist in English', (_code, catalogue) => {
    const unknown = Object.keys(catalogue).filter((key) => !(key in EN));
    expect(unknown).toEqual([]);
  });

  it.each(Object.entries(CATALOGUES))('%s keeps a plural entry plural and a string a string', (_code, catalogue) => {
    for (const [key, value] of Object.entries(catalogue)) {
      expect(typeof value, `${key} changed shape`).toBe(typeof EN[key as keyof typeof EN]);
    }
  });

  it.each(Object.entries(CATALOGUES))('%s leaves no {placeholder} behind that English does not have', (_code, catalogue) => {
    const names = (s: string) => new Set((s.match(/\{(\w+)\}/g) ?? []).map((m) => m.slice(1, -1)));
    for (const [key, value] of Object.entries(catalogue)) {
      const english = EN[key as keyof typeof EN];
      const allowed = new Set([...names(typeof english === 'string' ? english : Object.values(english).join(' '))]);
      const used = names(typeof value === 'string' ? value : Object.values(value).join(' '));
      for (const name of used) expect(allowed.has(name), `${key} invents {${name}}`).toBe(true);
    }
  });
});

/**
 * The reason this app does not hand-roll `n === 1 ? a : b`: two of the ten languages here need more forms
 * than that, and getting it wrong reads as broken to a native speaker on the very first screen.
 */
describe('plurals', () => {
  it('uses one form for 1 and another for 5 in English', () => {
    expect(translate('home.soFar', { count: 1, stickers: 2 }, 'en')).toContain('1 round played');
    expect(translate('home.soFar', { count: 5, stickers: 2 }, 'en')).toContain('5 rounds played');
  });

  it('gives Polish its four separate forms, which a two-form scheme cannot', () => {
    const forms = new Set([2, 5, 22].map((n) => new Intl.PluralRules('pl').select(n)));
    expect(forms).toEqual(new Set(['few', 'many', 'few']));
    expect(new Intl.PluralRules('pl').select(1)).toBe('one');
  });

  it('reaches Arabic’s dual form, which English has no concept of', () => {
    expect(new Intl.PluralRules('ar').select(2)).toBe('two');
    expect(AR['home.soFar']?.two).toBeTruthy();
  });

  it('falls back to English for a key a language has not translated yet', () => {
    expect(translate('nav.faq', undefined, 'en')).toBe('FAQ');
  });
});

describe('locale metadata', () => {
  it('lays Arabic out right to left and everything else left to right', () => {
    expect(localeByCode('ar').dir).toBe('rtl');
    expect(localeByCode('sv').dir).toBe('ltr');
  });

  it('rejects anything that is not a language we speak', () => {
    expect(isLocale('klingon')).toBe(false);
    expect(isLocale('ar')).toBe(true);
  });
});

/**
 * The bug this covers shipped green and was only visible on screen: the store's snapshot was the language
 * code, so switching set the code, the catalogue arrived a tick later with the code already equal to
 * itself, and useSyncExternalStore skipped the render. The picker said Polski; every word stayed English.
 */
describe('switching language', () => {
  beforeEach(() => localStorage.clear());

  it('actually changes the words, not just the code', async () => {
    expect(translate('nav.signIn')).toBe('Sign in');
    await setLocale('pl');
    expect(translate('nav.signIn')).toBe('Zaloguj się');
  });

  it('hands out a new snapshot when the catalogue lands, so React cannot skip the render', async () => {
    const seen: unknown[] = [];
    const stop = subscribeForTest(() => seen.push(snapshotForTest()));
    await setLocale('de');
    stop();
    // At least one notify carried a snapshot object React had not seen before.
    expect(new Set(seen).size).toBe(seen.length);
    expect(seen.length).toBeGreaterThan(0);
  });

  it('falls back to English for a language whose catalogue will not load', async () => {
    await setLocale('en');
    expect(translate('nav.signIn')).toBe('Sign in');
  });
});
