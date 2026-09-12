import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Users, Copy, LogIn, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";
import { useToast } from "@/shared/components/ui/use-toast";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";
import { useProfile } from "./ProfileContext";
import { type MemberEntry, type Profile, type SharedItem, displayName, initials, isManaged, sharedQueue, unanimous } from "./model";

type Group = { id: string; name: string; invite_code: string; owner_user_id: string };
type Member = { profile_id: string; role: string; profiles: Profile };

const CERTIFICATES = ["U", "PG", "12", "15", "18"];

export const ProfilePill = ({ profile, active, onClick }: { profile: Profile; active?: boolean; onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
      active ? "border-primary bg-primary/10 font-medium" : "hover:bg-muted"
    }`}
  >
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
      {initials(profile)}
    </span>
    {displayName(profile)}
    {isManaged(profile) && <Badge variant="outline" className="ml-1 text-[10px]">managed</Badge>}
  </button>
);

/** The group's queue, with who wants each title. Agreement sorts to the top. */
export const SharedQueueList = ({ items, names, memberIds }: { items: SharedItem[]; names: Map<string, string>; memberIds: string[] }) => {
  const agreed = new Set(unanimous(items, memberIds).map((i) => i.title_id));
  if (!items.length) return <p className="text-sm text-muted-foreground">Nobody has anything on their list yet.</p>;
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.title_id} className="flex items-center gap-3 rounded-lg border p-3">
          {item.image_url ? (
            <img src={item.image_url} alt="" className="h-14 w-10 shrink-0 rounded object-cover" />
          ) : (
            <div className="h-14 w-10 shrink-0 rounded bg-muted" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">{item.title_name}</span>
              {agreed.has(item.title_id) && <Badge>everyone</Badge>}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {item.wanted_by.map((id) => names.get(id) ?? "Someone").join(", ")}
            </p>
          </div>
          {item.certification && <Badge variant="outline">{item.certification}</Badge>}
        </li>
      ))}
    </ul>
  );
};

const HouseholdScreen = () => {
  const { user } = useAuth();
  const { profiles, active, setActive, reload } = useProfile();
  const { toast } = useToast();

  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Record<string, Member[]>>({});
  const [queues, setQueues] = useState<Record<string, SharedItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileCert, setNewProfileCert] = useState<string>("none");
  const [newGroupName, setNewGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);

  const loadGroups = useCallback(async () => {
    if (!user) return;
    const { data: groupRows } = await supabase.from("groups").select("id, name, invite_code, owner_user_id");
    const list = (groupRows ?? []) as Group[];
    setGroups(list);

    const byGroup: Record<string, Member[]> = {};
    const queueByGroup: Record<string, SharedItem[]> = {};
    for (const group of list) {
      const { data: memberRows } = await supabase
        .from("group_members")
        .select("profile_id, role, profiles(id, name, user_id, owner_user_id, max_certification, avatar_url, colour)")
        .eq("group_id", group.id);
      byGroup[group.id] = (memberRows ?? []) as unknown as Member[];

      const ids = byGroup[group.id].map((m) => m.profile_id);
      if (ids.length) {
        const { data: entries } = await supabase
          .from("watch_entries")
          .select("profile_id, title_id, status, titles(name, genres, certification, image_url)")
          .in("profile_id", ids)
          .eq("status", "want_to_watch");
        const flattened: MemberEntry[] = (entries ?? []).map((e) => ({
          profile_id: e.profile_id as string,
          title_id: e.title_id as string,
          status: e.status as string,
          title_name: e.titles?.name ?? "",
          genres: e.titles?.genres ?? [],
          certification: e.titles?.certification ?? null,
          image_url: e.titles?.image_url ?? null,
        }));
        queueByGroup[group.id] = sharedQueue(flattened, active ?? undefined);
      } else {
        queueByGroup[group.id] = [];
      }
    }
    setMembers(byGroup);
    setQueues(queueByGroup);
    setLoading(false);
  }, [user, active]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const addManagedProfile = async () => {
    if (!user || !newProfileName.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").insert({
      owner_user_id: user.id,
      name: newProfileName.trim(),
      max_certification: newProfileCert === "none" ? null : newProfileCert,
      is_public: false,
    } as never);
    setBusy(false);
    if (error) {
      toast({ title: "Couldn't add that profile", description: error.message, variant: "destructive" });
      return;
    }
    setNewProfileName("");
    setNewProfileCert("none");
    await reload();
    toast({ title: "Profile added" });
  };

  const createGroup = async () => {
    if (!user || !active || !newGroupName.trim()) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("groups")
      .insert({ name: newGroupName.trim(), owner_user_id: user.id } as never)
      .select("id")
      .single();
    if (!error && data) {
      await supabase.from("group_members").insert({ group_id: data.id, profile_id: active.id, role: "owner" } as never);
    }
    setBusy(false);
    if (error) {
      toast({ title: "Couldn't create the group", description: error.message, variant: "destructive" });
      return;
    }
    setNewGroupName("");
    await loadGroups();
  };

  const joinGroup = async () => {
    if (!active || !joinCode.trim()) return;
    setBusy(true);
    const { data: group } = await supabase.from("groups").select("id").eq("invite_code", joinCode.trim()).maybeSingle();
    if (!group) {
      setBusy(false);
      toast({ title: "No group with that code", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("group_members").insert({ group_id: group.id, profile_id: active.id } as never);
    setBusy(false);
    if (error) {
      toast({ title: "Couldn't join", description: error.message, variant: "destructive" });
      return;
    }
    setJoinCode("");
    await loadGroups();
  };

  const addProfileToGroup = async (groupId: string, profileId: string) => {
    const { error } = await supabase.from("group_members").insert({ group_id: groupId, profile_id: profileId } as never);
    if (error) {
      toast({ title: "Couldn't add them", description: error.message, variant: "destructive" });
      return;
    }
    await loadGroups();
  };

  const removeMember = async (groupId: string, profileId: string) => {
    await supabase.from("group_members").delete().eq("group_id", groupId).eq("profile_id", profileId);
    await loadGroups();
  };

  const names = new Map(profiles.map((p) => [p.id, displayName(p)]));
  for (const list of Object.values(members)) for (const m of list) if (m.profiles) names.set(m.profile_id, displayName(m.profiles));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Household</h1>
        <p className="text-muted-foreground">Who's watching, and what you're all queueing up.</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">Profiles</h2>
        <div className="flex flex-wrap gap-2">
          {profiles.map((p) => (
            <ProfilePill key={p.id} profile={p} active={p.id === active?.id} onClick={() => setActive(p.id)} />
          ))}
        </div>
        <Card className="space-y-3 p-4">
          <p className="text-sm text-muted-foreground">
            Add someone who doesn't have their own login — a child, say. You keep control of their list,
            and an age cap keeps anything above it off their suggestions.
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="grow">
              <label htmlFor="profile-name" className="text-sm font-medium">Name</label>
              <Input id="profile-name" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} placeholder="Tara" />
            </div>
            <div className="w-32">
              <label htmlFor="profile-cert" className="text-sm font-medium">Age cap</label>
              <Select value={newProfileCert} onValueChange={setNewProfileCert}>
                <SelectTrigger id="profile-cert"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No cap</SelectItem>
                  {CERTIFICATES.map((c) => <SelectItem key={c} value={c}>{c} and below</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addManagedProfile} disabled={busy || !newProfileName.trim()}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Groups</h2>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          groups.map((group) => {
            const roster = members[group.id] ?? [];
            const memberIds = roster.map((m) => m.profile_id);
            const notInGroup = profiles.filter((p) => !memberIds.includes(p.id));
            return (
              <Card key={group.id} className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{group.name}</span>
                    <Badge variant="secondary">{roster.length}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      void navigator.clipboard.writeText(group.invite_code);
                      toast({ title: "Invite code copied" });
                    }}
                  >
                    <Copy className="mr-2 h-3 w-3" /> {group.invite_code}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {roster.map((m) => (
                    <span key={m.profile_id} className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
                      {names.get(m.profile_id) ?? "Someone"}
                      {m.role !== "owner" && (
                        <button type="button" onClick={() => removeMember(group.id, m.profile_id)} aria-label="Remove">
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </button>
                      )}
                    </span>
                  ))}
                  {notInGroup.map((p) => (
                    <Button key={p.id} variant="outline" size="sm" onClick={() => addProfileToGroup(group.id, p.id)}>
                      <Plus className="mr-1 h-3 w-3" /> {displayName(p)}
                    </Button>
                  ))}
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium">Shared queue</h3>
                  <SharedQueueList items={queues[group.id] ?? []} names={names} memberIds={memberIds} />
                </div>
              </Card>
            );
          })
        )}

        <Card className="flex flex-wrap items-end gap-2 p-4">
          <div className="grow">
            <label htmlFor="group-name" className="text-sm font-medium">New group</label>
            <Input id="group-name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Home" />
          </div>
          <Button onClick={createGroup} disabled={busy || !newGroupName.trim()}>
            <Plus className="mr-2 h-4 w-4" /> Create
          </Button>
          <div className="grow">
            <label htmlFor="join-code" className="text-sm font-medium">Join with a code</label>
            <Input id="join-code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="invite code" />
          </div>
          <Button variant="outline" onClick={joinGroup} disabled={busy || !joinCode.trim()}>
            <LogIn className="mr-2 h-4 w-4" /> Join
          </Button>
        </Card>
      </section>
    </div>
  );
};

export default HouseholdScreen;
