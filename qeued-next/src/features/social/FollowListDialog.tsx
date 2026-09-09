import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "@/shared/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface Profile {
  user_id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface FollowListDialogProps {
  userId: string;
  type: "followers" | "following";
  count: number;
  children: React.ReactNode;
}

const FollowListDialog = ({ userId, type, count, children }: FollowListDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) loadProfiles();
  }, [open]);

  const loadProfiles = async () => {
    setLoading(true);
    const column = type === "followers" ? "follower_id" : "following_id";
    const filterColumn = type === "followers" ? "following_id" : "follower_id";

    const { data: follows } = await supabase
      .from("follows")
      .select(column)
      .eq(filterColumn, userId);

    if (!follows || follows.length === 0) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const userIds = follows.map((f: any) => f[column]);
    const { data: profs } = await supabase
      .from("profiles")
      .select("user_id, name, username, avatar_url")
      .in("user_id", userIds);

    const filtered = ((profs as Profile[]) || []).filter(p => p.user_id !== user?.id);
    setProfiles(filtered);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="capitalize">{type} ({count})</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : profiles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No {type} yet</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {profiles.map((p) => (
              <Link
                key={p.user_id}
                to={p.username ? `/p/${p.username}` : "#"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 hover:bg-muted rounded-lg p-2 -mx-2 transition-colors"
              >
                <Avatar className="h-9 w-9">
                  {p.avatar_url && <AvatarImage src={p.avatar_url} />}
                  <AvatarFallback className="text-xs">{(p.name || "?")[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name || "Unknown"}</p>
                  {p.username && <p className="text-xs text-muted-foreground">@{p.username}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowListDialog;
