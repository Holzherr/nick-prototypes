import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/shared/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Loader2 } from "lucide-react";

type WatchStatus = "watched" | "watching" | "want_to_watch" | "dropped";

interface Props {
  titleId?: string | null;
  titleName: string;
  /** If already added, show badge instead */
  currentStatus?: WatchStatus | null;
  /** Called after successful add */
  onStatusChange?: (status: WatchStatus) => void;
  /** For recommendation cards that need to resolve title ID */
  resolveTitleId?: () => Promise<string | null>;
  /** Trigger size */
  size?: "sm" | "default";
  className?: string;
}

const statusLabels: Record<WatchStatus, string> = {
  want_to_watch: "Want to Watch",
  watching: "Watching",
  watched: "Watched",
  dropped: "Dropped",
};

const AddToWatchlistSelect = ({
  titleId,
  titleName,
  currentStatus,
  onStatusChange,
  resolveTitleId,
  size = "sm",
  className = "",
}: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  if (currentStatus) {
    return <Badge variant="outline" className="text-xs">{statusLabels[currentStatus]} ✓</Badge>;
  }

  const handleChange = async (status: WatchStatus) => {
    if (!user) {
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

      const { error } = await supabase.from("watch_entries").upsert(
        { user_id: user.id, title_id: resolvedId, status },
        { onConflict: "user_id,title_id" }
      );
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
