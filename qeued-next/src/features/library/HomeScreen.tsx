import { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@/shared/utils/cn";
import { feedVerb } from "./model";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import { useAuth } from "@/features/auth/AuthContext";
import { useProfile } from "@/features/household/ProfileContext";
import { supabase } from "@/shared/supabase/client";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Sparkles, Users, Film, Plus, Loader2, Star, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import RecommendationCard, { type Recommendation } from "@/features/recommend/RecommendationCard";

const moods = [
  { value: "", label: "Any", emoji: "" },
  { value: "easy", label: "Easy", emoji: "😌" },
  { value: "intense", label: "Intense", emoji: "🔥" },
  { value: "funny", label: "Funny", emoji: "😂" },
  { value: "smart", label: "Smart", emoji: "🧠" },
] as const;

const types = [
  { value: "", label: "All" },
  { value: "movie", label: "🎬 Movies" },
  { value: "series", label: "📺 Series" },
] as const;

const times = [
  { value: "", label: "Any" },
  { value: "short", label: "⏱ Short" },
  { value: "long", label: "🕐 Long" },
] as const;

const CACHE_KEY = "qeued_recs_cache";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CachedRecs {
  personal: Recommendation[];
  shared: Recommendation[];
  timestamp: number;
  filters: string;
}

const getCachedRecs = (filterKey: string): CachedRecs | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedRecs = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) return null;
    if (cached.filters !== filterKey) return null;
    return cached;
  } catch {
    return null;
  }
};

const setCachedRecs = (personal: Recommendation[], shared: Recommendation[], filterKey: string) => {
  try {
    const data: CachedRecs = { personal, shared, timestamp: Date.now(), filters: filterKey };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
};

const Index = () => {
  const { user } = useAuth();
  const { active } = useProfile();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [sharedRecs, setSharedRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [watchCount, setWatchCount] = useState<number | null>(null);
  const loadingRef = useRef(false);
  const [feedTab, setFeedTab] = useState<"recs" | "following">("recs");
  const [followingFeed, setFollowingFeed] = useState<any[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);

  // Filters
  const [mood, setMood] = useState("");
  const [type, setType] = useState("");
  const [time, setTime] = useState("");

  const filterKey = `${mood}|${type}|${time}`;

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    const { count } = await supabase
      .from("watch_entries")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", active!.id);
    setWatchCount(count || 0);
    if ((count || 0) > 0) {
      // Try cache first
      const cached = getCachedRecs(filterKey);
      if (cached) {
        setRecommendations(cached.personal);
        setSharedRecs(cached.shared);
        setLoading(false);
      } else {
        await loadRecommendations();
      }
    } else {
      setLoading(false);
    }
  };

  const getExcludedTitles = async (): Promise<Set<string>> => {
    const [{ data: watchedEntries }, { data: skipped }] = await Promise.all([
      supabase
        .from("watch_entries")
        .select("title_id, titles(name)")
        .eq("profile_id", active!.id),
      supabase
        .from("skipped_recommendations")
        .select("title_name")
        .eq("user_id", user!.id)
        .gte("expires_at", new Date().toISOString()),
    ]);

    const names = new Set<string>();
    (watchedEntries || []).forEach((e: any) => {
      if (e.titles?.name) names.add(e.titles.name.toLowerCase());
    });
    (skipped || []).forEach((s: any) => {
      if (s.title_name) names.add(s.title_name.toLowerCase());
    });
    return names;
  };

  const loadRecommendations = async (append = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const excludedSet = await getExcludedTitles();

      const allExcludedTitles = [
        ...Array.from(excludedSet),
        ...(append ? recommendations.map((r) => r.title.toLowerCase()) : []),
        ...(append ? sharedRecs.map((r) => r.title.toLowerCase()) : []),
      ];

      const body: Record<string, any> = {
        user_id: user!.id,
        exclude_titles: allExcludedTitles,
      };
      if (mood) body.mood = mood;
      if (type) body.type_filter = type;
      if (time) body.time_filter = time;

      const { data } = await supabase.functions.invoke("get-recommendations", { body });

      const filterExcluded = (recs: Recommendation[]) =>
        recs.filter((r) => !excludedSet.has(r.title.toLowerCase()));

      let newPersonal = recommendations;
      let newShared = sharedRecs;

      if (data?.personal) {
        const filtered = filterExcluded(data.personal);
        if (append) {
          setRecommendations((prev) => {
            const existingTitles = new Set(prev.map((r) => r.title.toLowerCase()));
            const newOnes = filtered.filter((r) => !existingTitles.has(r.title.toLowerCase()));
            newPersonal = [...prev, ...newOnes];
            return newPersonal;
          });
        } else {
          newPersonal = filtered;
          setRecommendations(filtered);
        }
      }
      if (data?.shared) {
        const filtered = filterExcluded(data.shared);
        if (append) {
          setSharedRecs((prev) => {
            const existingTitles = new Set(prev.map((r) => r.title.toLowerCase()));
            const newOnes = filtered.filter((r) => !existingTitles.has(r.title.toLowerCase()));
            newShared = [...prev, ...newOnes];
            return newShared;
          });
        } else {
          newShared = filtered;
          setSharedRecs(filtered);
        }
      }

      // Cache results (only for non-append loads)
      if (!append) {
        setCachedRecs(newPersonal, newShared, filterKey);
      }
    } catch (e) {
      console.error("Failed to load recommendations", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  };

  const handleNeedMore = useCallback(() => {
    if (!loadingMore) {
      loadRecommendations(true);
    }
  }, [loadingMore]);

  const applyFilters = () => {
    localStorage.removeItem(CACHE_KEY);
    setRecommendations([]);
    setSharedRecs([]);
    loadRecommendations();
  };

  const hasFilters = mood || type || time;

  const loadFollowingFeed = async () => {
    setFollowingLoading(true);
    try {
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user!.id);
      if (!follows || follows.length === 0) {
        setFollowingFeed([]);
        setFollowingLoading(false);
        return;
      }
      const followingIds = follows.map((f: any) => f.following_id);
      const { data: entries } = await supabase
        .from("watch_entries")
        .select("id, status, watched_rating, watched_date, review, updated_at, user_id, title:titles(id, name, type, genres, imdb_rating, year, image_url)")
        .in("user_id", followingIds)
        .order("updated_at", { ascending: false })
        .limit(50);
      // Enrich with profile info
      const userIds = [...new Set((entries || []).map((e: any) => e.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, username, avatar_url")
        .in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      setFollowingFeed((entries || []).map((e: any) => ({ ...e, profile: profileMap.get(e.user_id) })));
    } catch (e) {
      console.error("Failed to load following feed", e);
    }
    setFollowingLoading(false);
  };

  useEffect(() => {
    if (feedTab === "following" && followingFeed.length === 0 && user) {
      loadFollowingFeed();
    }
  }, [feedTab]);

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-1">
          {watchCount! > 0
            ? `You've tracked ${watchCount} titles. Here are your recommendations.`
            : "Start by searching and adding titles to your watchlist!"}
        </p>
      </div>

      {watchCount === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Film className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">What have you been watching?</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Add a movie or series you've watched recently and we'll start building personalized recommendations for you.
            </p>
            <Link to="/search">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add your first title
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Filters are now inside the feed toggle header */}

      {loading && feedTab === "recs" && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Feed toggle */}
      {watchCount! > 0 && (
        <Tabs value={feedTab} onValueChange={(v) => setFeedTab(v as "recs" | "following")}>
          <div className="flex items-center gap-2 mb-4">
            <TabsList>
              <TabsTrigger value="recs" className="gap-1.5">
                <Sparkles className="h-4 w-4" /> Recommended
              </TabsTrigger>
              <TabsTrigger value="following" className="gap-1.5">
                <Users className="h-4 w-4" /> Following
              </TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-1.5">
              {feedTab === "recs" && (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={hasFilters ? "default" : "outline"} size="sm" className="gap-1.5">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filter{hasFilters ? "s ✓" : ""}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-4" align="end">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Mood</p>
                          <div className="flex flex-wrap gap-1.5">
                            {moods.map((m) => (
                              <Button key={m.value} variant={mood === m.value ? "default" : "outline"} size="sm" className="h-7 text-xs px-2.5" onClick={() => setMood(m.value)}>
                                {m.emoji ? `${m.emoji} ${m.label}` : m.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Type</p>
                          <div className="flex flex-wrap gap-1.5">
                            {types.map((t) => (
                              <Button key={t.value} variant={type === t.value ? "default" : "outline"} size="sm" className="h-7 text-xs px-2.5" onClick={() => setType(t.value)}>
                                {t.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Length</p>
                          <div className="flex flex-wrap gap-1.5">
                            {times.map((t) => (
                              <Button key={t.value} variant={time === t.value ? "default" : "outline"} size="sm" className="h-7 text-xs px-2.5" onClick={() => setTime(t.value)}>
                                {t.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <Button size="sm" className="w-full" onClick={applyFilters} disabled={loading || loadingMore}>
                          <Sparkles className="h-3 w-3 mr-1" />
                          Apply filters
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {recommendations.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { localStorage.removeItem(CACHE_KEY); setRecommendations([]); setSharedRecs([]); loadRecommendations(); }}
                      disabled={loading || loadingMore}
                    >
                      <Loader2 className={cn("h-4 w-4", (loading || loadingMore) && "animate-spin")} />
                      Refresh
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </Tabs>
      )}

      {/* Recommendations feed */}
      {feedTab === "recs" && recommendations.length > 0 && (
        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec, i) => (
              <RecommendationCard
                key={`${rec.title}-${i}`}
                rec={rec}
                userId={user!.id}
                onRemoved={() => setRecommendations((prev) => prev.filter((r) => r.title !== rec.title))}
                onNeedMore={handleNeedMore}
              />
            ))}
          </div>
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </section>
      )}

      {feedTab === "recs" && sharedRecs.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Best to watch together</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sharedRecs.map((rec, i) => (
              <RecommendationCard
                key={`shared-${rec.title}-${i}`}
                rec={rec}
                shared
                userId={user!.id}
                onRemoved={() => setSharedRecs((prev) => prev.filter((r) => r.title !== rec.title))}
                onNeedMore={handleNeedMore}
              />
            ))}
          </div>
        </section>
      )}

      {/* Following feed */}
      {feedTab === "following" && (
        <section>
          {followingLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {!followingLoading && followingFeed.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No recent activity from people you follow.</p>
              <p className="text-muted-foreground text-xs mt-1">Follow users from their profiles to see their activity here.</p>
            </div>
          )}
          <div className="space-y-3">
            {followingFeed.map((entry: any) => {
              const statusLabel = feedVerb(entry.status);
              return (
                <Card key={entry.id}>
                  <CardContent className="py-4 px-4">
                    <div className="flex items-start gap-3">
                      <Link to={entry.profile?.username ? `/p/${entry.profile.username}` : "#"}>
                        <Avatar className="h-8 w-8">
                          {entry.profile?.avatar_url && <AvatarImage src={entry.profile.avatar_url} />}
                          <AvatarFallback className="text-xs">{(entry.profile?.name || "?")[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <Link to={entry.profile?.username ? `/p/${entry.profile.username}` : "#"} className="font-medium hover:underline">{entry.profile?.name || "Someone"}</Link>
                          {" "}<span className="text-muted-foreground">{statusLabel}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {entry.title?.image_url && (
                            <img src={entry.title.image_url} alt="" className="h-14 w-10 rounded object-cover shrink-0" />
                          )}
                          <div className="min-w-0">
                            <Link to={`/title/${entry.title?.id}`} className="font-medium text-sm hover:underline">{entry.title?.name}</Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{entry.title?.type === "series" ? "Series" : "Movie"} · {entry.title?.year}</span>
                              {entry.title?.imdb_rating && (
                                <span className="flex items-center gap-0.5 text-xs"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{entry.title.imdb_rating}</span>
                              )}
                              {entry.watched_rating && <span className="text-xs">{"⭐".repeat(entry.watched_rating)}</span>}
                            </div>
                            {entry.review && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.review}</p>}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{new Date(entry.updated_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {feedTab === "recs" && watchCount! > 0 && recommendations.length === 0 && !loading && (
        <div className="text-center py-8">
          <Button onClick={() => loadRecommendations()} disabled={loading}>
            <Sparkles className="mr-2 h-4 w-4" />
            Get recommendations
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
