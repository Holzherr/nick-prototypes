import { useState, type FormEvent } from 'react';
import { guestProfiles } from '@/features/progress/guest';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cleanName, NAME_MAX, readName, readTheme, startPlaying, writeTheme } from './player';
import { type ThemeId } from './themes';
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
  const [existing] = useState(() => guestProfiles());
  const [name, setName] = useState(readName);
  const [theme, setTheme] = useState<ThemeId>(readTheme);
  const [missing, setMissing] = useState(false);

  const returning = existing[0];
  const pick = (id: ThemeId) => {
    setTheme(id);
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
        <ThemeMark theme={theme} size={84} className="mx-auto" />
        <h1 className="mt-5 text-[clamp(30px,5.5vw,54px)] font-bold leading-[1.05] text-raspberry">Welcome back, {returning.child.name}</h1>
        <p className="mt-3 text-lg text-grape/80">
          {returning.rounds} round{returning.rounds === 1 ? '' : 's'} played and {returning.stickers} sticker{returning.stickers === 1 ? '' : 's'} so far, kept on
          this device.
        </p>
        <Button size="lg" className="mt-6" onClick={() => (window.location.hash = '/app')}>
          Carry on playing →
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-[880px] text-center">
      <ThemeMark theme={theme} size={84} className="mx-auto" />
      <h1 className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[clamp(30px,5.5vw,54px)] font-bold leading-[1.05] text-raspberry">
        <span className="relative">
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setMissing(false);
            }}
            maxLength={NAME_MAX}
            aria-label="Your child’s name"
            aria-invalid={missing}
            placeholder="Your name"
            autoComplete="off"
            autoCapitalize="words"
            spellCheck={false}
            size={11}
            className="h-auto w-[min(11ch,68vw)] rounded-3xl border-dashed px-3 py-1 text-center text-[clamp(28px,5vw,50px)] font-bold text-raspberry placeholder:font-normal placeholder:text-grape/35"
          />
        </span>
        <span>’s Maths Garden</span>
      </h1>

      <p className="mt-5 font-semibold text-grape/80">Pick your icon — it changes the colours too</p>
      <div className="mt-3">
        <ThemePicker value={theme} onChange={pick} />
      </div>

      {missing && <p className="mt-4 font-semibold text-raspberry">Type a name first — it goes on the printables too.</p>}

      <Button type="submit" size="lg" className="mt-7">
        Start playing →
      </Button>
      <p className="mt-3 text-sm text-grape/60">
        No account, no email. Everything stays on this device — you can save it to an account later.{' '}
        <a href="#/login" className="font-semibold text-raspberry underline">
          Already have one?
        </a>
      </p>
    </form>
  );
}
