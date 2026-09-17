import { useState, type FormEvent } from 'react';
import { themeForGlyph } from '@/features/personalise/themes';
import { writeTheme } from '@/features/personalise/player';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils/cn';
import { EXTRA_AVATARS, THEME_AVATARS, type Child } from '../model';

export interface EditChildPanelProps {
  child: Child;
  onSave: (patch: Partial<Omit<Child, 'id'>>) => Promise<unknown>;
}

const NAME_MAX = 40;

/**
 * Rename a child, change their picture, or set a birthday that was skipped at sign-up.
 *
 * Both were write-once before this: the profile form ran at creation and there was no way back to it, so a
 * misspelt name stayed misspelt on every printable and a picture chosen by a three-year-old was permanent.
 *
 * The first row of pictures is the homepage icons, and choosing one repaints the app — the homepage says
 * the icon changes the colours, and this is the same choice, so it had better do the same thing. The
 * second row is just pictures.
 */
export function EditChildPanel({ child, onSave }: EditChildPanelProps) {
  const [name, setName] = useState(child.name);
  const [avatar, setAvatar] = useState(child.avatar);
  const [birthdate, setBirthdate] = useState(child.birthdate ?? '');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  const dirty = name.trim() !== child.name || avatar !== child.avatar || (birthdate || null) !== child.birthdate;

  const choose = (glyph: string) => {
    setAvatar(glyph);
    setState('idle');
    // Repaint straight away rather than on save: the point of the row is seeing what it does.
    const theme = themeForGlyph(glyph);
    if (theme) writeTheme(theme);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const clean = name.trim().slice(0, NAME_MAX);
    if (!clean) return;
    setState('saving');
    try {
      await onSave({ name: clean, avatar, birthdate: birthdate || null });
      setState('saved');
    } catch {
      setState('failed');
    }
  };

  const Picture = ({ glyph }: { glyph: string }) => (
    <button
      key={glyph}
      type="button"
      aria-pressed={avatar === glyph}
      aria-label={glyph}
      onClick={() => choose(glyph)}
      className={cn('size-12 rounded-full bg-blush text-2xl transition', avatar === glyph && 'scale-110 bg-petal ring-4 ring-bubble')}
    >
      {glyph}
    </button>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 text-left">
      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">Name</span>
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setState('idle');
          }}
          required
          maxLength={NAME_MAX}
          autoComplete="off"
          aria-label="Child’s name"
        />
        <span className="text-sm text-grape/60">This goes on the printables and in the app.</span>
      </label>

      <fieldset>
        <legend className="mb-2 font-semibold">Picture</legend>
        <p className="mb-2 text-sm text-grape/60">These eight also change the app’s colours.</p>
        <div className="flex flex-wrap gap-2.5">
          {THEME_AVATARS.map((glyph) => (
            <Picture key={glyph} glyph={glyph} />
          ))}
        </div>
        <p className="mb-2 mt-4 text-sm text-grape/60">And these are just pictures.</p>
        <div className="flex flex-wrap gap-2.5">
          {EXTRA_AVATARS.map((glyph) => (
            <Picture key={glyph} glyph={glyph} />
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">
          Birthday <span className="font-normal text-grape/60">(optional)</span>
        </span>
        <Input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} aria-label="Birthday" />
        <span className="text-sm text-grape/60">Only used to show an age on this screen.</span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={!dirty || state === 'saving' || !name.trim()}>
          {state === 'saving' ? 'Saving…' : 'Save changes'}
        </Button>
        {state === 'saved' && !dirty && <span className="font-semibold text-leaf-deep">Saved.</span>}
        {state === 'failed' && <span className="font-semibold text-clay">That didn’t save — check your connection and try again.</span>}
      </div>
    </form>
  );
}
