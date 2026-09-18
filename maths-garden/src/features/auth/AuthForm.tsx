import { useState, type FormEvent } from 'react';
import type { GuestProfile } from '@/features/progress/guest';
import { Logo } from '@/shared/brand/Logo';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { GuestDataPanel } from './GuestDataPanel';

export type AuthMode = 'sign-in' | 'sign-up';

export interface AuthFormProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  /** On sign-up the form only submits once the parent has ticked the Terms box. */
  onSubmit: (email: string, password: string) => void;
  /** Offered when a confirmation link failed or the address is unconfirmed; sends a fresh link to the typed email. */
  onResend?: (email: string) => void;
  /** Emails a password-reset link to the typed address. */
  onForgot?: (email: string) => void;
  /** Omitted while the Google provider is disabled in Supabase; the button is hidden rather than shown broken. */
  onGoogle?: () => void;
  /** Set inside an app's built-in browser (LinkedIn, Instagram, Gmail…), where Google refuses to sign anyone in. */
  inApp?: string | null;
  /** Play without an account; progress stays on the device. */
  onGuest: () => void;
  /** Guest play already on this device, so the card can say where it is instead of looking like it is gone. */
  guestProfiles?: readonly GuestProfile[];
  busy?: boolean;
  error?: string | null;
  notice?: string | null;
  /** Shown instead of submitting when the backend isn't connected. */
  unavailable?: string | null;
}

/** Google "G" in brand colours, 20px. */
const GoogleMark = () => (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

/**
 * Stands in for the Google button inside an app's own browser. Google answers sign-ins from there with
 * "Error 403: disallowed_useragent", so the honest offer is the way out to Safari — or email, just below.
 */
function OpenInBrowser({ app }: { app: string }) {
  const [copied, setCopied] = useState(false);
  const where = app === 'an app' ? 'this app’s built-in browser' : `${app}’s built-in browser`;
  return (
    <div className="mt-6 rounded-[20px] bg-sunny/25 p-4 text-sm text-grape/85">
      <p>
        <b>Google sign-in doesn’t work inside {where}.</b> Tap <b>•••</b> or the share button and choose <b>Open in Safari</b> (or <b>Open in browser</b>) — or
        use your email below.
      </p>
      <Button
        type="button"
        variant="quiet"
        size="sm"
        className="mt-3"
        onClick={() => {
          void navigator.clipboard?.writeText(window.location.href).then(() => setCopied(true));
        }}
      >
        {copied ? '✓ Link copied — paste it into Safari' : '🔗 Copy link to open in Safari'}
      </Button>
    </div>
  );
}

/**
 * Centred cream card: logo, "Grown-ups sign in here", Continue with Google, then email + password with a pink
 * submit, a sign-in/create-account toggle, and a link to the free printables.
 *
 * The password can be revealed, because typing one blind on an iPad is how people get locked out. A space
 * at either end is called out separately: autofill adds them, they are rejected, and they stay invisible
 * even when the password is shown.
 *
 * When this device has guest play on it, the card says so before you sign in — signing in opens an account
 * child with no history, and without that the play looks deleted at the worst possible moment.
 */
export function AuthForm({
  mode,
  onModeChange,
  onSubmit,
  onResend,
  onForgot,
  onGoogle,
  inApp,
  onGuest,
  guestProfiles = [],
  busy = false,
  error,
  notice,
  unavailable,
}: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [needEmail, setNeedEmail] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const padded = password !== password.trim();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(email.trim(), password);
  };
  return (
    <div className="relative z-10 flex min-h-dvh items-center justify-center px-5 py-10">
      <Card className="w-full max-w-[440px]">
        <a href="#/home" className="text-sm font-semibold text-raspberry hover:underline">
          ← Maths Garden
        </a>
        <div className="mt-2 flex justify-center">
          <Logo size={52} />
        </div>
        <p className="mt-3 text-center text-grape/70">Grown-ups sign in here. Your child plays without needing to, and this device stays signed in.</p>
        {onGoogle && inApp && <OpenInBrowser app={inApp} />}
        {onGoogle && !inApp && (
          <>
            <Button variant="quiet" size="md" className="mt-6 w-full" onClick={onGoogle} disabled={busy || Boolean(unavailable)}>
              <GoogleMark />
              Continue with Google
            </Button>
            {mode === 'sign-up' && (
              // Google sign-up skips the form below and its box, so the agreement is stated where the button is.
              <p className="mt-2 text-center text-xs text-grape/60">
                By continuing with Google you confirm you’re the child’s parent or guardian and agree to the{' '}
                <a href="#/terms" target="_blank" rel="noopener" className="underline">
                  Terms and Conditions
                </a>
                .
              </p>
            )}
            <div className="mt-5 flex items-center gap-3 text-xs uppercase text-grape/50">
              <span className="h-0.5 flex-1 bg-petal" />
              or
              <span className="h-0.5 flex-1 bg-petal" />
            </div>
          </>
        )}
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <Input
            type="email"
            placeholder="Email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative">
            <Input
              type={show ? 'text' : 'password'}
              placeholder="Password"
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              // Only a new password has to meet the length rule; an older account may have a shorter one.
              {...(mode === 'sign-up' ? { minLength: 8 } : {})}
              className="pr-14"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
          {padded && (
            <p className="text-sm font-medium text-clay">
              There’s a space at the {password !== password.trimStart() ? 'start' : 'end'} — autofill does that, and it will be rejected.{' '}
              <button type="button" className="font-semibold text-raspberry underline" onClick={() => setPassword(password.trim())}>
                Remove it
              </button>
            </p>
          )}
          {mode === 'sign-up' && (
            // Unticked by default and required: the Terms are accepted by the parent, for themselves and the
            // child, so it has to be an action they take. The Privacy Policy is a notice, linked, not agreed to.
            <label htmlFor="agree-terms" className="flex items-start gap-3 text-sm leading-snug text-grape/80">
              <input
                id="agree-terms"
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-raspberry"
              />
              <span>
                I’m the child’s parent or guardian and I agree to the{' '}
                <a href="#/terms" target="_blank" rel="noopener" className="font-semibold text-raspberry underline">
                  Terms and Conditions
                </a>
                . The{' '}
                <a href="#/privacy" target="_blank" rel="noopener" className="font-semibold text-raspberry underline">
                  Privacy Policy
                </a>{' '}
                explains what we keep and why.
              </span>
            </label>
          )}
          {mode === 'sign-in' && onForgot && (
            <button
              type="button"
              disabled={busy}
              onClick={() => (email.trim() ? onForgot(email.trim()) : setNeedEmail(true))}
              className="self-end text-sm font-semibold text-raspberry underline"
            >
              Forgot password?
            </button>
          )}
          {needEmail && !email.trim() && <p className="text-sm font-medium text-clay">Type your email above, then tap “Forgot password?” again.</p>}
          {error && <p className="text-sm font-medium text-raspberry">{error}</p>}
          {onResend && (
            <Button
              type="button"
              variant="quiet"
              size="sm"
              disabled={busy || !email.trim()}
              onClick={() => onResend(email.trim())}
              title={email.trim() ? undefined : 'Type your email above first'}
            >
              ✉️ Send a fresh confirmation link
            </Button>
          )}
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
        <GuestDataPanel profiles={guestProfiles} onContinueAsGuest={onGuest} />

        <p className="mt-4 border-t-2 border-dashed border-petal pt-4 text-center text-sm">
          <a href="#/resources" className="font-semibold text-raspberry underline">
            🖨 Free printable maths cards
          </a>{' '}
          <span className="text-grape/60">(no sign-in needed)</span>
        </p>
        {guestProfiles.length === 0 && (
          <>
            <Button variant="quiet" size="md" className="mt-5 w-full" onClick={onGuest}>
              Guest mode
            </Button>
            <p className="mt-2 text-center text-xs text-grape/55">Play now without an account. Progress stays on this device.</p>
          </>
        )}
      </Card>
    </div>
  );
}
