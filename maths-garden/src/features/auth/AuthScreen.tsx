import { useState } from 'react';
import { track } from '@/features/analytics/events';
import { GOOGLE_SIGN_IN } from '@/app/config';
import { guestProfiles } from '@/features/progress/guest';
import { cloudConfigured, supabase } from '@/shared/supabase/client';
import { TERMS_VERSION } from '@/features/legal/documents';
import { AuthForm, type AuthMode } from './AuthForm';
import { takeLinkProblem } from './link-problem';

export default function AuthScreen({ onGuest }: { onGuest: () => void }) {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  // Read once: it only changes by playing, which cannot happen from this screen.
  const [guests] = useState(() => guestProfiles());
  const [busy, setBusy] = useState(false);
  // Arriving from a refused email link says why, and offers a fresh one, instead of a blank form.
  const [linkProblem] = useState(() => takeLinkProblem());
  const [error, setError] = useState<string | null>(linkProblem);
  const [notice, setNotice] = useState<string | null>(null);
  const [offerResend, setOfferResend] = useState(Boolean(linkProblem));
  const redirectTo = `${location.origin}${import.meta.env.BASE_URL}`;

  const resend = async (email: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: redirectTo } });
    setBusy(false);
    if (resendError) return setError(resendError.message);
    setOfferResend(false);
    setNotice(`A fresh link is on its way to ${email}. Tap it once — on an iPhone, open it in Safari if the mail app asks.`);
  };

  const submit = async (email: string, password: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const { data, error: authError } =
      mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: redirectTo,
              // The record that this parent ticked the box, and which wording they agreed to.
              data: {
                terms_version: TERMS_VERSION,
                terms_accepted_at: new Date().toISOString(),
              },
            },
          });
    setBusy(false);
    if (authError) {
      // Supabase's wording for this is "Email not confirmed", which reads as a dead end.
      if (/not confirmed/i.test(authError.message)) {
        setOfferResend(true);
        return setError('This email isn’t confirmed yet. Tap the link we emailed you, or send a fresh one.');
      }
      return setError(authError.message);
    }
    // Counted from the form only. Doing it from the auth state change would count every session restore
    // as a sign-in, which would make the number meaningless. Google sign-in returns via a redirect and so
    // is not counted here — the visit that follows it still is.
    track(mode === 'sign-in' ? 'sign_in' : 'signup');
    if (mode === 'sign-up' && !data.session) setNotice('Check your email to confirm the account, then sign in.');
  };

  // Supabase's Google provider; comes back to this app's base URL (nickholzherr.com/maths or the preview).
  const google = async () => {
    setBusy(true);
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}${import.meta.env.BASE_URL}` },
    });
    if (oauthError) {
      setError(oauthError.message);
      setBusy(false);
    }
  };

  return (
    <AuthForm
      onGoogle={GOOGLE_SIGN_IN ? google : undefined}
      onGuest={onGuest}
      guestProfiles={guests}
      mode={mode}
      onModeChange={(next) => {
        setMode(next);
        setError(null);
        setNotice(null);
        setOfferResend(false);
      }}
      onSubmit={submit}
      onResend={offerResend ? (email) => void resend(email) : undefined}
      busy={busy}
      error={error}
      notice={notice}
      unavailable={cloudConfigured ? null : 'Not connected to Supabase yet (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local).'}
    />
  );
}
