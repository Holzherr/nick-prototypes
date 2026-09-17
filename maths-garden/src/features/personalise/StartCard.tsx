import { useState, type FormEvent } from 'react';
import { useT } from '@/features/i18n/i18n';
import { guestProfiles } from '@/features/progress/guest';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils/cn';
import { cleanName, NAME_MAX, readName, readTheme, startPlaying, writeTheme } from './player';
import { nextTheme, type ThemeId } from './themes';
import { ThemeMark } from './ThemeMark';
import { ThemePicker } from './ThemePicker';

/**
 * The homepage's front door: type a name, pick an icon, play.
 *
 * This is the headline, not a widget under it — the first thing on the page is the child's own name in
 * the title, which is the whole promise of the app in one line. No account, no email, no profile form.
 *
 * A device that has already played skips all of it and gets a "carry on" button instead: asking a
 * returning child to type their name again is how you lose the history they already have.
 */
export function StartCard() {
  const t = useT();
  const [existing] = useState(() => guestProfiles());
  const [name, setName] = useState(readName);
  const [theme, setTheme] = useState<ThemeId>(readTheme);
  const [missing, setMissing] = useState(false);
  // The nudge stops the moment someone discovers the control; it is a hint, not a decoration.
  const [touched, setTouched] = useState(false);

  const returning = existing[0];
  const pick = (id: ThemeId) => {
    setTheme(id);
    setTouched(true);
    writeTheme(id);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!cleanName(name)) return setMissing(true);
    startPlaying(name, theme);
    window.location.hash = '/app';
  };

  if (returning) {
    return (
      <div className="mx-auto max-w-[620px] text-center">
        <button type="button" onClick={() => pick(nextTheme(theme))} aria-label={t('home.changeIcon')} className="mx-auto block rounded-[26px] transition-transform hover:-translate-y-1 active:translate-y-0.5">
          <ThemeMark theme={theme} size={84} />
        </button>
        <h1 className="mt-5 text-[clamp(30px,5.5vw,54px)] font-bold leading-[1.05] text-raspberry">{t('home.welcomeBack', { name: returning.child.name })}</h1>
        <p className="mt-3 text-lg text-grape/80">
          {t('home.soFar', { count: returning.rounds, stickers: returning.stickers })}
        </p>
        <Button size="lg" className="mt-6" onClick={() => (window.location.hash = '/app')}>
          {t('home.carryOn')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-[880px] text-center">
      {/* The tile is the thing a person reaches for, so it has to be the control. Left as a plain picture
          it read as decoration: a grey pencil nobody knew was a door. It now presses like a button, wears
          a badge saying what tapping does, and nudges itself until someone has actually changed it. */}
      <button
        type="button"
        onClick={() => pick(nextTheme(theme))}
        aria-label={t('home.changeIcon')}
        className={cn(
          'group relative mx-auto block rounded-[26px] transition-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-raspberry',
          'hover:-translate-y-1 active:translate-y-0.5',
          !touched && 'motion-safe:animate-bounce-slow',
        )}
      >
        <ThemeMark theme={theme} size={84} />
        <span
          aria-hidden
          className="absolute -bottom-1.5 -right-1.5 flex size-8 items-center justify-center rounded-full bg-cream text-[17px] shadow-[0_2px_0_var(--color-petal)] transition-transform group-hover:rotate-90"
        >
          🎨
        </span>
      </button>
      <p className="mt-2 text-sm font-semibold text-bubble">{t('home.tapToChange')}</p>
      <h1 className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[clamp(30px,5.5vw,54px)] font-bold leading-[1.05] text-raspberry">
        {t('home.titlePrefix') && <span>{t('home.titlePrefix')}</span>}
        <span className="relative">
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setMissing(false);
            }}
            maxLength={NAME_MAX}
            aria-label={t('home.nameLabel')}
            aria-invalid={missing}
            placeholder={t('home.namePlaceholder')}
            autoComplete="off"
            autoCapitalize="words"
            spellCheck={false}
            size={11}
            className="h-auto w-[min(11ch,68vw)] rounded-3xl border-dashed px-3 py-1 text-center text-[clamp(28px,5vw,50px)] font-bold text-raspberry placeholder:font-normal placeholder:text-grape/35"
          />
        </span>
        {t('home.titleSuffix') && <span>{t('home.titleSuffix')}</span>}
      </h1>

      <p className="mt-5 font-semibold text-grape/80">{t('home.pickIcon')}</p>
      <div className="mt-3">
        <ThemePicker value={theme} onChange={pick} />
      </div>

      {missing && <p className="mt-4 font-semibold text-raspberry">{t('home.needName')}</p>}

      <Button type="submit" size="lg" className="mt-7">
        {t('home.start')}
      </Button>
      <p className="mt-3 text-sm text-grape/60">
        {t('home.noAccount')}{' '}
        <a href="#/login" className="font-semibold text-raspberry underline">
          {t('home.haveAccount')}
        </a>
      </p>
    </form>
  );
}
