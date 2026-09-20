import { useRef, useState, type FormEvent } from 'react';
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
  const nameRef = useRef<HTMLInputElement>(null);

  const returning = existing[0];
  const pick = (id: ThemeId) => {
    setTheme(id);
    writeTheme(id);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!cleanName(name)) {
      // Say it, point at it, and put the cursor in it. The button is at the bottom of a tall hero and the
      // field is up in the heading, so a message next to the button explains nothing about where to go —
      // on a laptop the two are not even on screen together.
      setMissing(true);
      nameRef.current?.focus();
      nameRef.current?.select();
      return;
    }
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
      {/* The tile is a preview of the picked icon, and the picker under it is the one way to pick. The
          tile used to be a control as well — it cycled themes on tap, wore a 🎨 badge and bounced until
          used, with "Tap to change" underneath — because as a plain picture it had read as decoration.
          That put three controls for one choice on the screen with the fewest words on it; with the picker
          directly under the tile, the tile no longer has to explain itself. */}
      <div className="flex justify-center">
        <ThemeMark theme={theme} size={84} />
      </div>
      <div className="mt-3">
        <ThemePicker value={theme} onChange={pick} />
      </div>
      <p className="mt-2 text-sm text-grape/70">{t('home.pickIcon')}</p>
      <h1 className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[clamp(30px,5.5vw,54px)] font-bold leading-[1.05] text-raspberry">
        {t('home.titlePrefix') && <span>{t('home.titlePrefix')}</span>}
        <span className="relative">
          <Input
            ref={nameRef}
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
            className={cn(
              'h-auto w-[min(11ch,68vw)] rounded-3xl border-dashed px-3 py-1 text-center text-[clamp(28px,5vw,50px)] font-bold text-raspberry placeholder:font-normal placeholder:text-grape/35',
              // clay, not raspberry: raspberry is the accent, and in the plain theme the accent is black,
              // so an error drawn in it is indistinguishable from ordinary text. clay means warning in every
              // theme because no theme overrides it.
              missing && 'border-solid border-clay bg-clay/5 motion-safe:animate-wobble placeholder:text-clay/60',
            )}
          />
        </span>
        {t('home.titleSuffix') && <span>{t('home.titleSuffix')}</span>}
      </h1>

      {/* Under the field it refers to, not next to the button that triggered it. role=alert so it is
          spoken rather than only drawn. */}
      <p role="alert" className={cn('mt-3 font-semibold text-clay transition-opacity', missing ? 'opacity-100' : 'sr-only opacity-0')}>
        {missing ? t('home.needName') : ''}
      </p>

      <Button type="submit" size="lg" className="mt-7">
        {t('home.start')}
      </Button>
      <p className="mt-3 text-sm text-grape/60">
        {t('home.noAccount')}{' '}
        <a href="#/login" className="font-semibold text-raspberry underline">
          {t('home.haveAccount')}
        </a>
      </p>
      <p className="mt-2 text-xs text-grape/55">
        {t('legal.agreePlaying')}{' '}
        <a href="#/terms" className="underline hover:text-raspberry">
          {t('footer.terms')}
        </a>{' '}
        ·{' '}
        <a href="#/privacy" className="underline hover:text-raspberry">
          {t('footer.privacy')}
        </a>
      </p>
    </form>
  );
}
