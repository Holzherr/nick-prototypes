import { useState } from "react";
import { useHousehold } from "@/features/household/useHousehold";
import { useAuth } from "@/features/auth/AuthContext";
import { Copy, Link2, Mail, Trash2, UserPlus, Users, Check, Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";

export default function Household() {
  const { user } = useAuth();
  const {
    householdId,
    householdName,
    members,
    invites,
    loading,
    renameHousehold,
    createInvite,
    deleteInvite,
    removeMember,
  } = useHousehold();

  const [inviteEmail, setInviteEmail] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!householdId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-muted-foreground">
        No household found. Please log in to get started.
      </div>
    );
  }

  const isOwner = members.find((m) => m.user_id === user?.id)?.role === "owner";

  const handleCreateLinkInvite = async () => {
    try {
      const data = await createInvite();
      if (data) {
        const link = `${window.location.origin}/join/${(data as any).invite_code}`;
        await navigator.clipboard.writeText(link);
        toast.success("Invite link copied to clipboard!");
      }
    } catch {
      toast.error("Failed to create invite");
    }
  };

  const handleCreateEmailInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await createInvite(inviteEmail.trim());
      toast.success(`Invite created for ${inviteEmail.trim()}`);
      setInviteEmail("");
    } catch {
      toast.error("Failed to create invite");
    }
  };

  const handleCopyLink = async (code: string, id: string) => {
    const link = `${window.location.origin}/join/${code}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveName = async () => {
    if (nameValue.trim()) {
      await renameHousehold(nameValue.trim());
      toast.success("Household renamed");
    }
    setEditingName(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                className="h-8 text-lg font-semibold"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSaveName}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{householdName}</h1>
              {isOwner && (
                <button
                  onClick={() => { setEditingName(true); setNameValue(householdName); }}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Members */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Members</h2>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-2 px-3 rounded-lg border">
              {m.avatar_url ? (
                <img src={m.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {(m.display_name || "?").charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{m.display_name || "User"}</div>
                <div className="text-[11px] text-muted-foreground capitalize">{m.role}</div>
              </div>
              {isOwner && m.user_id !== user?.id && (
                <button
                  onClick={() => removeMember(m.id)}
                  className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Invite */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          <UserPlus className="h-3.5 w-3.5 inline mr-1.5" />
          Invite people
        </h2>

        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleCreateLinkInvite}>
            <Link2 className="h-4 w-4" />
            Create invite link
          </Button>

          <div className="flex gap-2">
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              onKeyDown={(e) => e.key === "Enter" && handleCreateEmailInvite()}
            />
            <Button variant="outline" onClick={handleCreateEmailInvite} disabled={!inviteEmail.trim()}>
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Pending invites */}
      {invites.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Pending invites</h2>
          <div className="space-y-2">
            {invites.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 py-2 px-3 rounded-lg border text-sm">
                <div className="flex-1 min-w-0">
                  {inv.invited_email ? (
                    <div className="truncate">{inv.invited_email}</div>
                  ) : (
                    <div className="text-muted-foreground">Link invite</div>
                  )}
                  <div className="text-[10px] text-muted-foreground">
                    Expires {new Date(inv.expires_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleCopyLink(inv.invite_code, inv.id)}
                  className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                  title="Copy link"
                >
                  {copiedId === inv.id ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={() => deleteInvite(inv.id)}
                  className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
