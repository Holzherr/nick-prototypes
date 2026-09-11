import { useState, type FormEvent } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils/cn';
import { AVATARS, type Child } from '../model';

export interface ChildFormProps {
  onSubmit: (input: Omit<Child, 'id'>) => void;
  busy?: boolean;
  error?: string | null;
  onCancel?: () => void;
}

/** First name, optional birthday, a row of emoji pictures to pick from, then Create profile. */
export function ChildForm({ onSubmit, busy = false, error, onCancel }: ChildFormProps) {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSubmit({ name: name.trim(), birthdate: birthdate || null, avatar });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 text-left">
      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">First name</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={40} autoComplete="off" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">
          Birthday <span className="font-normal text-grape/60">(optional)</span>
        </span>
        <Input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
      </label>
      <fieldset>
        <legend className="mb-2 font-semibold">Picture</legend>
        <div className="flex flex-wrap gap-2.5">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={avatar === a}
              onClick={() => setAvatar(a)}
              className={cn('size-14 rounded-full bg-blush text-3xl transition', avatar === a && 'scale-110 bg-petal ring-4 ring-bubble')}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>
      {error && <p className="text-sm font-medium text-raspberry">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Create profile'}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
