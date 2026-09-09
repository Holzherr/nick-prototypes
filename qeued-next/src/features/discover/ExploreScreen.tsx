import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/shared/supabase/client";
import PublicHeader from "@/shared/layout/PublicHeader";
import { Input } from "@/shared/components/ui/input";
import { Loader2, Search, Users } from "lucide-react";

interface PublicProfile {
  user_id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
}

const ExplorePage = () => {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, name, username, bio, avatar_url")
      .eq("is_public", true)
      .not("username", "is", null)
      .order("created_at", { ascending: false })
      .limit(100);
    setProfiles((data as PublicProfile[]) || []);
    setLoading(false);
  };

  const filtered = query.trim()
    ? profiles.filter(
        (p) =>
          p.name?.toLowerCase().includes(query.toLowerCase()) ||
          p.username?.toLowerCase().includes(query.toLowerCase()) ||
          p.bio?.toLowerCase().includes(query.toLowerCase())
      )
    : profiles;

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Explore people
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Discover users on Qeued and see what they're watching.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            {query ? "No users found matching your search." : "No public profiles yet."}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <Link
                key={p.user_id}
                to={`/p/${p.username}`}
                className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                      {(p.name || p.username || "?")[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.name || p.username}</p>
                  <p className="text-sm text-muted-foreground">@{p.username}</p>
                  {p.bio && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.bio}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
