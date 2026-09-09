import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/shared/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);

        if (_event === "SIGNED_IN" && session) {
          // Process pending follow from public profile
          const pendingFollow = localStorage.getItem("pending_follow");
          if (pendingFollow) {
            localStorage.removeItem("pending_follow");
            supabase
              .from("follows")
              .select("id")
              .eq("follower_id", session.user.id)
              .eq("following_id", pendingFollow)
              .maybeSingle()
              .then(({ data }) => {
                if (!data) {
                  supabase
                    .from("follows")
                    .insert({ follower_id: session.user.id, following_id: pendingFollow })
                    .then(() => {});
                }
              });
          }

          // Refresh popular cache on sign-in (runs in background)
          supabase.functions.invoke("get-popular", {
            body: { refresh: true },
          }).catch(() => {});
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
