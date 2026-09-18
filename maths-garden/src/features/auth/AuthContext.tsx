import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/shared/supabase/client';
import { finishRecovery, isRecovering, markRecovery } from './recovery';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  /** Signed in by a password-reset link, and the new password is not chosen yet. */
  recovering: boolean;
  endRecovery: () => void;
}

const AuthContext = createContext<AuthState>({ session: null, user: null, loading: true, signOut: async () => {}, recovering: false, endRecovery: () => {} });

export const useAuth = () => useContext(AuthContext);

/** The parent's Supabase session, persisted in local storage so the iPad stays signed in. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(isRecovering);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') {
        markRecovery();
        setRecovering(true);
      }
      setSession(next);
      setLoading(false);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    finishRecovery();
    setRecovering(false);
    await supabase.auth.signOut();
  };
  const endRecovery = () => {
    finishRecovery();
    setRecovering(false);
  };

  return <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut, recovering, endRecovery }}>{children}</AuthContext.Provider>;
}
