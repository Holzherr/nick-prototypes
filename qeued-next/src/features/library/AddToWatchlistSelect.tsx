import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";
import { useProfile } from "@/features/household/ProfileContext";
import { useToast } from "@/shared/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Loader2 } from "lucide-react";

import { STATUS_LABELS as statusLabels, type WatchStatus } from "./model";

/** Where a list entry came from. The database keeps the first one written (0027). */
export type EntrySource = "recommendation" | "tonight" | "search" | "title_page" | "manual";

type EntryRow = { user_id: string; profile_id: string; title_id: string; status: WatchStatus; watched_rating?: number; watched_date?: string };

/**
 * Adds a title to a profile's list. `source` goes into the insert only: an entry that already
 * exists (23505) is updated without it. PGRST204 means 0027 is not live yet, so the insert is
 * tried once more without `source` rather than failing the add.
 */
export const addWatchEntry = async (row: EntryRow, source: EntrySource) => {
  let { error } = await supabase.from("watch_entries").insert({ ...row, source });
  if (error?.code === "PGRST204") ({ error } = await supabase.from("watch_entries").insert(row));
  if (error?.code !== "23505") return { error };
  const { profile_id, title_id, ...changes } = row;
  return supabase.from("watch_entries").update(changes).eq("profile_id", profile_id).eq("title_id", title_id);
};

interface Props {
  titleId?: string | null;
  titleName: string;
  /** If already added, show badge instead */
  currentStatus?: WatchStatus | null;
  /** Called after successful add */
  onStatusChange?: (status: WatchStatus) => void;
  /** For recommendation cards that need to resolve title ID */
  resolveTitleId?: () => Promise<string | null>;
  /** Written on a new entry only, never over an existing one */
  source?: EntrySource;
  /** Trigger size */
  size?: "sm" | "default";
  className?: string;
}

const AddToWatchlistSelect = ({
  titleId,
  titleName,
  currentStatus,
  onStatusChange,
  resolveTitleId,
  source = "manual",
  size = "sm",
  className = "",
}: Props) => {
  const { user } = useAuth();
  const { active } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  if (currentStatus) {
    return <Badge variant="outline" className="text-xs">{statusLabels[currentStatus]} ✓</Badge>;
  }

  const handleChange = async (status: WatchStatus) => {
    if (!user || !active) {
      navigate("/auth");
      return;
    }

    setSaving(true);
    try {
      let resolvedId = titleId;
      if (!resolvedId && resolveTitleId) {
        resolvedId = await resolveTitleId();
      }
      if (!resolvedId) {
        toast({ title: "Couldn't find title", variant: "destructive" });
        return;
      }

      const { error } = await addWatchEntry({ user_id: user.id, profile_id: active.id, title_id: resolvedId, status }, source);
      if (error) throw error;

      toast({
        title: "Added!",
        description: `${titleName} added as "${status.replace(/_/g, " ")}"`,
      });
      onStatusChange?.(status);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const triggerClass = size === "sm" ? "h-8 text-xs" : "h-9 text-sm";

  return (
    <Select onValueChange={(v) => handleChange(v as WatchStatus)} disabled={saving}>
      <SelectTrigger className={`w-full ${triggerClass} ${className}`}>
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <SelectValue placeholder="Add to..." />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="want_to_watch">Want to Watch</SelectItem>
        <SelectItem value="watching">Watching</SelectItem>
        <SelectItem value="watched">Watched</SelectItem>
        <SelectItem value="dropped">Dropped</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default AddToWatchlistSelect;
