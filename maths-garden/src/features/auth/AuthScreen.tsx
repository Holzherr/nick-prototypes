import { useState } from 'react';
import { cloudConfigured, supabase } from '@/shared/supabase/client';
import { AuthForm, type AuthMode } from './AuthForm';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('sign-in');
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

  return (
    <AuthForm
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
