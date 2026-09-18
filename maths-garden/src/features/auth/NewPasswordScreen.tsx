import { useState, type FormEvent } from 'react';
import { Logo } from '@/shared/brand/Logo';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';

export interface NewPasswordScreenProps {
  email: string;
  /** Saves the password; resolves to an error message, or null when it is saved. */
  onSave: (password: string) => Promise<string | null>;
  /** Carry on into the app once the password is saved. */
  onDone: () => void;
}

/** Where a password-reset link lands: one field, revealable, then straight on into the garden. */
export function NewPasswordScreen({ email, onSave, onDone }: NewPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== password.trim()) return setError('There’s a space at the start or end — remove it and try again.');
    setBusy(true);
    setError(null);
    const failed = await onSave(password);
    setBusy(false);
    if (failed) return setError(failed);
    setSaved(true);
  };

  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center px-5 py-10">
      <Card className="w-full max-w-[440px]">
        <div className="flex justify-center">
          <Logo size={52} />
        </div>
        {saved ? (
          <>
            <p className="mt-4 text-center text-lg font-semibold text-leaf-deep">✓ Password changed</p>
            <p className="mt-2 text-center text-grape/70">Use it next time you sign in as {email}.</p>
            <Button size="md" className="mt-6 w-full" onClick={onDone}>
              Carry on →
            </Button>
          </>
        ) : (
          <form onSubmit={(e) => void submit(e)} className="mt-4 flex flex-col gap-3">
            <p className="text-center text-grape/70">
              Choose a new password for <b className="break-all">{email}</b>.
            </p>
            <div className="relative">
              <Input
                id="new-password"
                type={show ? 'text' : 'password'}
                placeholder="New password (8 or more characters)"
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                minLength={8}
                required
                className="pr-14"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow((current) => !current)}
                aria-label={show ? 'Hide password' : 'Show password'}
                aria-pressed={show}
                className="absolute right-1 top-1 flex h-10 w-12 items-center justify-center rounded-xl text-xl transition-colors hover:bg-blush"
              >
                {show ? '🙈' : '👁'}
              </button>
            </div>
            {error && <p className="text-sm font-medium text-raspberry">{error}</p>}
            <Button type="submit" size="md" className="mt-2" disabled={busy}>
              {busy ? 'One moment…' : 'Save new password'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
