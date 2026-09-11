import { useState, type FormEvent } from 'react';
import { Logo } from '@/shared/brand/Logo';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';

export type AuthMode = 'sign-in' | 'sign-up';

export interface AuthFormProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (email: string, password: string) => void;
  busy?: boolean;
  error?: string | null;
  notice?: string | null;
  /** Shown instead of submitting when the backend isn't connected. */
  unavailable?: string | null;
}

/** Centred cream card: logo, "Grown-ups sign in here", email + password, pink submit, and a sign-in/create-account toggle. */
export function AuthForm({ mode, onModeChange, onSubmit, busy = false, error, notice, unavailable }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(email.trim(), password);
  };
  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center px-5 py-10">
      <Card className="w-full max-w-[440px]">
        <div className="flex justify-center">
          <Logo size={52} />
        </div>
        <p className="mt-3 text-center text-grape/70">Grown-ups sign in here. Your child plays without needing to, and this device stays signed in.</p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <Input type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            type="password"
            placeholder="Password"
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm font-medium text-raspberry">{error}</p>}
          {notice && <p className="text-sm font-medium text-leaf-deep">{notice}</p>}
          {unavailable && <p className="text-sm text-clay">{unavailable}</p>}
          <Button type="submit" size="md" className="mt-2" disabled={busy || Boolean(unavailable)}>
            {busy ? 'One moment…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-grape/70">
          {mode === 'sign-in' ? 'New here?' : 'Already have an account?'}{' '}
          <button type="button" className="font-semibold text-raspberry underline" onClick={() => onModeChange(mode === 'sign-in' ? 'sign-up' : 'sign-in')}>
            {mode === 'sign-in' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
        <p className="mt-4 border-t-2 border-dashed border-petal pt-4 text-center text-sm">
          <a href="#/resources" className="font-semibold text-raspberry underline">
            🖨 Free printable maths cards
          </a>{' '}
          <span className="text-grape/60">(no sign-in needed)</span>
        </p>
      </Card>
    </div>
  );
}
