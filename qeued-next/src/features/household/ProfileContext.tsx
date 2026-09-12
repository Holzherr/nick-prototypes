import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";
import type { Profile } from "./model";

const ACTIVE_KEY = "qeued-active-profile";

type ProfileContextType = {
  /** Every profile this account controls: its own, plus any it manages. */
  profiles: Profile[];
  /** Whose list is being read and written right now. */
  active: Profile | null;
  loading: boolean;
  setActive: (profileId: string) => void;
  reload: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType>({
  profiles: [],
  active: null,
  loading: true,
  setActive: () => {},
  reload: async () => {},
});

export const useProfile = () => useContext(ProfileContext);

const COLUMNS = "id, name, user_id, owner_user_id, max_certification, avatar_url, colour";

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem(ACTIVE_KEY));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setProfiles([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select(COLUMNS)
      .or(`user_id.eq.${user.id},owner_user_id.eq.${user.id}`)
      .order("created_at", { ascending: true });
    setProfiles((data ?? []) as Profile[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  // The account's own profile is the default; a stored choice only wins if it still exists.
  const active = useMemo(() => {
    if (!profiles.length) return null;
    return profiles.find((p) => p.id === activeId) ?? profiles.find((p) => p.user_id === user?.id) ?? profiles[0];
  }, [profiles, activeId, user]);

  const setActive = useCallback((profileId: string) => {
    localStorage.setItem(ACTIVE_KEY, profileId);
    setActiveId(profileId);
  }, []);

  const value = useMemo(
    () => ({ profiles, active, loading, setActive, reload: load }),
    [profiles, active, loading, setActive, load],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
