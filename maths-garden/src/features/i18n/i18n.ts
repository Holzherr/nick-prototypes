import { useSyncExternalStore } from 'react';
import { readJSON, writeJSON } from '@/shared/utils/storage';
import { DEFAULT_LOCALE, detectLocale, isLocale, localeByCode, type LocaleCode } from './locales';
import { EN, type Catalogue, type Plural, type StringKey } from './strings';

/**
 * Translation without a library.
 *
 * react-i18next is about 40KB for features this app does not need — no namespaces, no backends, no
 * interpolation engine beyond {name}. What it WOULD have brought is correct plurals, and `Intl.PluralRules`
 * already ships in every browser that runs this app: Polish takes one/few/many/other and Arabic takes six
 * forms, so the `n === 1 ? a : b` that every hand-rolled attempt reaches for is wrong in two of the ten
 * languages here before anyone types a word.
 *
 * English is the source and the fallback, and it is bundled. Every other language is a dynamic import, so
 * a Spanish visitor never downloads Arabic.
 */
const KEY = 'maths-garden:locale';

/**
 * The snapshot is a fresh object on every change, never a mutated one.
 *
 * useSyncExternalStore compares snapshots by identity and skips the render when they match — so a store
 * that returned just the language code went quiet at exactly the wrong moment: switching to Polish set the
 * code immediately, then the catalogue arrived a tick later with the code already equal to itself, React
 * saw no change and kept every string in English. The picker said Polski and the page did not.
 */
interface State {
  locale: LocaleCode;
  catalogue: Partial<Catalogue>;
}

let state: State = { locale: DEFAULT_LOCALE, catalogue: EN };
const listeners = new Set<() => void>();
const loaded = new Map<LocaleCode, Partial<Catalogue>>([['en', EN]]);

const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  for (const fn of listeners) fn();
};

const loaders: Record<Exclude<LocaleCode, 'en'>, () => Promise<{ default: Partial<Catalogue> }>> = {
  es: () => import('./catalogues/es'),
  fr: () => import('./catalogues/fr'),
  de: () => import('./catalogues/de'),
  pl: () => import('./catalogues/pl'),
  pt: () => import('./catalogues/pt'),
  it: () => import('./catalogues/it'),
  nl: () => import('./catalogues/nl'),
  sv: () => import('./catalogues/sv'),
  hi: () => import('./catalogues/hi'),
  ar: () => import('./catalogues/ar'),
};

/** Lay the page out for this language and tell assistive tech which one it is. */
function applyLocale(code: LocaleCode) {
  const { dir } = localeByCode(code);
  document.documentElement.lang = code;
  document.documentElement.dir = dir;
}

/**
 * Switch language. The catalogue arrives asynchronously, so the app keeps rendering English underneath
 * rather than blanking — a missing word is survivable, a blank screen is not.
 */
export async function setLocale(code: LocaleCode) {
  writeJSON(KEY, code);
  applyLocale(code);

  const already = loaded.get(code);
  if (already) return set({ locale: code, catalogue: already });

  // English underneath while the catalogue is in flight: a missing word is survivable, a blank screen is not.
  set({ locale: code, catalogue: EN });
  try {
    const mod = await loaders[code as Exclude<LocaleCode, 'en'>]();
    loaded.set(code, mod.default);
    // Another switch may have landed while this one was in flight; the last one asked for wins.
    if (state.locale === code) set({ catalogue: mod.default });
  } catch {
    // A language that will not load falls back to English rather than taking the app down with it.
  }
}

/** The remembered choice, or the device's own language. Called once, before the first render. */
export function bootLocale() {
  const saved = readJSON<string | null>(KEY, null);
  const code = isLocale(saved) ? saved : detectLocale();
  applyLocale(code);
  state = { ...state, locale: code };
  if (code !== DEFAULT_LOCALE) void setLocale(code);
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

const EMPTY: State = { locale: DEFAULT_LOCALE, catalogue: EN };
const useStore = (): State => useSyncExternalStore(subscribe, () => state, () => EMPTY);

export const useLocale = (): LocaleCode => useStore().locale;

/** True once the visitor has said which language they want, rather than the device having guessed. */
export const localeWasChosen = () => isLocale(readJSON<string | null>(KEY, null));

type Vars = Record<string, string | number>;

const fill = (template: string, vars?: Vars) =>
  vars ? template.replace(/\{(\w+)\}/g, (whole, name: string) => (name in vars ? String(vars[name]) : whole)) : template;

/**
 * Look a string up, falling through to English for anything a translation has not got to yet. A key that
 * exists in neither renders as itself, which is ugly on purpose: it shows up in review instead of silently
 * rendering an empty element.
 */
/**
 * `code` picks the plural rules. The catalogue is only consulted for the language actually loaded — one is
 * in memory at a time — so asking for a language that is not current gives English words under that
 * language's plural rules, which is what the fallback would have rendered anyway.
 */
export function translate(key: StringKey, vars?: Vars, code: LocaleCode = state.locale): string {
  const entry: string | Plural | undefined = (code === state.locale ? state.catalogue[key] : undefined) ?? EN[key];
  if (entry === undefined) return key;

  if (typeof entry === 'string') return fill(entry, vars);

  // A plural entry: pick the form this language uses for this number.
  const count = Number(vars?.count ?? 0);
  const rule = new Intl.PluralRules(code).select(count);
  const chosen = entry[rule] ?? entry.other;
  return fill(chosen, vars);
}

/** The translator, re-rendering its component whenever the language changes. */
export function useT() {
  // Subscribing to the whole store, not just the code: the catalogue landing IS the change to render on.
  useStore();
  return translate;
}

/** Test-only windows onto the store, so the snapshot contract can be asserted rather than assumed. */
export const snapshotForTest = () => state;
export const subscribeForTest = subscribe;
