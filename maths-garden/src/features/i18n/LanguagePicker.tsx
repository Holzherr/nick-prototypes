import { setLocale, useLocale } from './i18n';
import { isLocale, LOCALES } from './locales';

/**
 * The language control.
 *
 * A native select, deliberately: it is the one control every phone renders as a familiar full-screen
 * wheel, it works with a screen reader without any help, and it does not need eleven flags — a flag is a
 * country, not a language, and picking one for Spanish or Arabic gets somebody wrong.
 *
 * Each language is named in itself, because someone looking for their own language is looking for the word
 * they would use for it, not the English one.
 */
export function LanguagePicker({ className }: { className?: string }) {
  const locale = useLocale();
  return (
    <label className={className}>
      <span className="sr-only">Choose a language</span>
      <select
        value={locale}
        aria-label="Choose a language"
        onChange={(e) => isLocale(e.target.value) && void setLocale(e.target.value)}
        className="h-10 rounded-full border-2 border-petal bg-cream px-3 font-semibold text-grape outline-none transition-colors focus:border-bubble"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.endonym}
          </option>
        ))}
      </select>
    </label>
  );
}
