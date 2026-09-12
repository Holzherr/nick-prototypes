import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Star, UserPlus, UserMinus, Lock, Loader2 } from "lucide-react";
import FollowListDialog from "@/features/social/FollowListDialog";
import { useToast } from "@/shared/components/ui/use-toast";
import PublicHeader from "@/shared/layout/PublicHeader";

type WatchStatus = "watched" | "watching" | "want_to_watch" | "dropped";

interface PublicEntry {
  id: string;
  title_id: string;
  status: WatchStatus;
  watched_rating: number | null;
  watched_date: string | null;
  review: string | null;
  notes: string | null;
  title: {
    name: string;
    type: string;
    genres: string[];
    imdb_rating: number | null;
    year: number | null;
    image_url: string | null;
  };
}

const statusLabels: Record<WatchStatus, string> = {
  watched: "Watched",
  watching: "Watching",
  want_to_watch: "Want to Watch",
  dropped: "Dropped",
};

const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<{ user_id: string; name: string | null; is_public: boolean; bio: string | null; avatar_url: string | null } | null>(null);
  const [entries, setEntries] = useState<PublicEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (username) loadPublicProfile();
  }, [username]);

  const loadPublicProfile = async () => {
    setLoading(true);
    const { data: prof } = await supabase
      .from("profiles")
      .select("id, user_id, name, is_public, username, bio, avatar_url")
      .eq("username", username!)
      .single();

    if (!prof) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (!prof.is_public) {
      setIsPrivate(true);
      setProfile(prof as any);
      setLoading(false);
      return;
    }

    setProfile(prof as any);

    // Load entries, follow counts, and follow status in parallel
    const entriesPromise = supabase
      .from("watch_entries")
      .select("id, title_id, status, watched_rating, watched_date, review, notes, title:titles(name, type, genres, imdb_rating, year, image_url)")
      .eq("profile_id", prof.id)
      .order("updated_at", { ascending: false });
    const followersPromise = supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("following_id", prof.user_id!);
    const followingPromise = supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("follower_id", prof.user_id!);

    const [entriesRes, followersRes, followingRes] = await Promise.all([
      entriesPromise, followersPromise, followingPromise,
    ]);

    setEntries((entriesRes.data as any) || []);
    setFollowerCount(followersRes.count || 0);
    setFollowingCount(followingRes.count || 0);

    if (user) {
      const { data: followData } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", prof.user_id!)
        .maybeSingle();
      setIsFollowing(!!followData);
    }

    setLoading(false);
  };

  const navigate = useNavigate();

  const toggleFollow = async () => {
    if (!profile) return;
    if (!user) {
      localStorage.setItem("pending_follow", profile.user_id);
      navigate("/auth");
      return;
    }
    setFollowLoading(true);
    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", profile.user_id);
      setIsFollowing(false);
      setFollowerCount((c) => c - 1);
      toast({ title: "Unfollowed" });
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: profile.user_id });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
      toast({ title: "Following!" });
    }
    setFollowLoading(false);
  };

  const filtered = (status: WatchStatus) => entries.filter((e) => e.status === status);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
          <p className="text-muted-foreground">This username doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{profile?.name || username}</h1>
          <p className="text-muted-foreground">This profile is private.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile?.user_id;

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start gap-5">
        <div className="h-20 w-20 rounded-full overflow-hidden bg-muted border-2 border-border shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
              {(profile?.name || username || "?")[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{profile?.name || username}</h1>
              <p className="text-muted-foreground text-sm">@{username}</p>
            </div>
            {!isOwnProfile && (
              <Button variant={isFollowing ? "outline" : "default"} size="sm" onClick={toggleFollow} disabled={followLoading}>
                {isFollowing ? <><UserMinus className="h-4 w-4 mr-1" /> Unfollow</> : <><UserPlus className="h-4 w-4 mr-1" /> Follow</>}
              </Button>
            )}
          </div>
          {profile?.bio && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{profile.bio}</p>
          )}
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <FollowListDialog userId={profile!.user_id} type="followers" count={followerCount}>
              <button className="hover:underline"><strong className="text-foreground">{followerCount}</strong> followers</button>
            </FollowListDialog>
            <FollowListDialog userId={profile!.user_id} type="following" count={followingCount}>
              <button className="hover:underline"><strong className="text-foreground">{followingCount}</strong> following</button>
            </FollowListDialog>
            <span><strong className="text-foreground">{entries.length}</strong> titles</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="watched">
        <TabsList>
          {(["watched", "watching", "want_to_watch", "dropped"] as WatchStatus[]).map((s) => (
            <TabsTrigger key={s} value={s} className="text-xs sm:text-sm">
              {statusLabels[s]} ({filtered(s).length})
            </TabsTrigger>
          ))}
        </TabsList>

        {(["watched", "watching", "want_to_watch", "dropped"] as WatchStatus[]).map((status) => (
          <TabsContent key={status} value={status} className="space-y-3 mt-4">
            {filtered(status).length === 0 && (
              <p className="text-muted-foreground text-sm py-8 text-center">No titles here yet</p>
            )}
            {filtered(status).map((entry) => (
              <Card key={entry.id}>
                <CardContent className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {entry.title.image_url ? (
                      <img src={entry.title.image_url} alt={entry.title.name} className="h-14 w-10 rounded object-cover shrink-0" />
                    ) : (
                      <div className="h-14 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link to={`/title/${entry.title_id}`} className="font-medium text-sm truncate hover:underline">{entry.title.name}</Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {entry.title.type === "series" ? "Series" : "Movie"} · {entry.title.year}
                        </span>
                        {entry.title.imdb_rating && (
                          <span className="flex items-center gap-0.5 text-xs">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {entry.title.imdb_rating}
                          </span>
                        )}
                        {entry.watched_rating && (
                          <Badge variant="secondary" className="text-xs">
                            {"⭐".repeat(entry.watched_rating)}
                          </Badge>
                        )}
                      </div>
                      {entry.review && (
                        <p className="text-sm text-muted-foreground mt-2">{entry.review}</p>
                      )}
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">"{entry.notes}"</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
      </div>
    </div>
  );
};

export default PublicProfilePage;
