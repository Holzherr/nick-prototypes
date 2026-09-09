import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";

export interface HouseholdMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  display_name?: string;
  avatar_url?: string;
}

export interface HouseholdInvite {
  id: string;
  invite_code: string;
  invited_email: string | null;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

export function useHousehold() {
  const { user } = useAuth();
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [householdName, setHouseholdName] = useState<string>("");
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [invites, setInvites] = useState<HouseholdInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHousehold = useCallback(async () => {
    if (!user) {
      setHouseholdId(null);
      setMembers([]);
      setInvites([]);
      setLoading(false);
      return;
    }

    try {
      // Get household ID via RPC
      const { data: hid } = await supabase.rpc("get_user_household_id", {
        _user_id: user.id,
      });

      if (!hid) {
        setLoading(false);
        return;
      }

      setHouseholdId(hid);

      // Fetch household details, members, and invites in parallel
      const [householdRes, membersRes, invitesRes] = await Promise.all([
        supabase.from("households").select("name").eq("id", hid).single(),
        supabase
          .from("household_members")
          .select("id, user_id, role, joined_at")
          .eq("household_id", hid)
          .order("joined_at"),
        supabase
          .from("household_invites")
          .select("id, invite_code, invited_email, created_at, expires_at, accepted_at")
          .eq("household_id", hid)
          .is("accepted_at", null)
          .order("created_at", { ascending: false }),
      ]);

      if (householdRes.data) setHouseholdName(householdRes.data.name);

      // Enrich members with profile data
      if (membersRes.data) {
        const userIds = membersRes.data.map((m: any) => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", userIds);

        const profileMap = new Map(
          (profiles || []).map((p: any) => [p.id, p])
        );

        setMembers(
          membersRes.data.map((m: any) => ({
            ...m,
            display_name: profileMap.get(m.user_id)?.display_name || "",
            avatar_url: profileMap.get(m.user_id)?.avatar_url || "",
          }))
        );
      }

      if (invitesRes.data) setInvites(invitesRes.data as HouseholdInvite[]);
    } catch (e) {
      console.error("Failed to fetch household:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHousehold();
  }, [fetchHousehold]);

  const renameHousehold = useCallback(
    async (name: string) => {
      if (!householdId) return;
      await supabase.from("households").update({ name }).eq("id", householdId);
      setHouseholdName(name);
    },
    [householdId]
  );

  const createInvite = useCallback(
    async (email?: string) => {
      if (!householdId || !user) return null;
      const { data, error } = await supabase
        .from("household_invites")
        .insert({
          household_id: householdId,
          invited_email: email || null,
          created_by: user.id,
        })
        .select("id, invite_code, invited_email, created_at, expires_at, accepted_at")
        .single();
      if (error) throw error;
      if (data) setInvites((prev) => [data as HouseholdInvite, ...prev]);
      return data;
    },
    [householdId, user]
  );

  const deleteInvite = useCallback(async (id: string) => {
    await supabase.from("household_invites").delete().eq("id", id);
    setInvites((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const removeMember = useCallback(
    async (memberId: string) => {
      await supabase.from("household_members").delete().eq("id", memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    },
    []
  );

  // The session_id to use for all data queries (household UUID or 'default' fallback)
  const sessionId = householdId || "default";

  return {
    householdId,
    householdName,
    members,
    invites,
    loading,
    sessionId,
    renameHousehold,
    createInvite,
    deleteInvite,
    removeMember,
    refresh: fetchHousehold,
  };
}
