import { useState } from 'react';
import { guestProfiles } from '@/features/progress/guest';
import { cloudConfigured, supabase } from '@/shared/supabase/client';
import { AuthForm, type AuthMode } from './AuthForm';

export default function AuthScreen({ onGuest }: { onGuest: () => void }) {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  // Read once: it only changes by playing, which cannot happen from this screen.
  const [guests] = useState(() => guestProfiles());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (email: string, password: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const { data, error: authError } =
      mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}${import.meta.env.BASE_URL}` } });
    setBusy(false);
    if (authError) return setError(authError.message);
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
      onGoogle={google}
      onGuest={onGuest}
      guestProfiles={guests}
      mode={mode}
      onModeChange={(next) => {
        setMode(next);
        setError(null);
        setNotice(null);
      }}
      onSubmit={submit}
      busy={busy}
      error={error}
      notice={notice}
      unavailable={cloudConfigured ? null : 'Not connected to Supabase yet (src/app/config.ts is blank).'}
    />
  );
}
