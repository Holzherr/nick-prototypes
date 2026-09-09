import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";
import PublicHeader from "@/shared/layout/PublicHeader";
import Layout from "@/shared/layout/Layout";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Star, Loader2, ArrowLeft, ExternalLink, User } from "lucide-react";
import AddToWatchlistSelect from "@/features/library/AddToWatchlistSelect";
import { useToast } from "@/shared/components/ui/use-toast";

type WatchStatus = "watched" | "watching" | "want_to_watch" | "dropped";

interface TitleData {
  id: string;
  name: string;
  type: "movie" | "series";
  genres: string[];
  imdb_rating: number | null;
  rt_rating: number | null;
  description: string | null;
  year: number | null;
  image_url: string | null;
  imdb_url: string | null;
  rt_url: string | null;
  director: string | null;
  cast_members: string[] | null;
  runtime_minutes: number | null;
  enriched: boolean;
}

interface ActorData {
  id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  character_name?: string;
}

const TitleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState<TitleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [userStatus, setUserStatus] = useState<WatchStatus | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [actors, setActors] = useState<ActorData[]>([]);

  useEffect(() => {
    if (id) loadTitle();
  }, [id, user]);

  const loadTitle = async () => {
    const { data, error } = await supabase
      .from("titles")
      .select("*")
      .eq("id", id!)
      .single();

    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const titleData = data as TitleData;
    setTitle(titleData);
    setLoading(false);

    if (user) {
      const { data: entry } = await supabase
        .from("watch_entries")
        .select("status, watched_rating")
        .eq("user_id", user.id)
        .eq("title_id", id!)
        .maybeSingle();
      if (entry) {
        setUserStatus(entry.status as WatchStatus);
        setUserRating(entry.watched_rating);
      }
    }

    // Load or enrich
    setEnriching(!titleData.enriched);
    try {
      const { data: enrichRes } = await supabase.functions.invoke("enrich-title", {
        body: { title_id: id },
      });
      if (enrichRes?.title) {
        setTitle(enrichRes.title as TitleData);
      }
      if (enrichRes?.actors) {
        setActors(enrichRes.actors as ActorData[]);
      }
    } catch (e) {
      console.error("Enrichment failed:", e);
    } finally {
      setEnriching(false);
    }
  };

  const addToList = async (status: WatchStatus) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!title) return;

    const { error } = await supabase.from("watch_entries").upsert(
      { user_id: user.id, title_id: title.id, status },
      { onConflict: "user_id,title_id" }
    );
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setUserStatus(status);
    toast({ title: `Marked as ${status.replace(/_/g, " ")}!`, description: title.name });
  };

  const goBack = () => {
    if (window.history.length > 1 && document.referrer.includes(window.location.hostname)) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const content = (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <button onClick={goBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {notFound && (
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-2">Title not found</h1>
          <p className="text-muted-foreground">This title doesn't exist in our database.</p>
        </div>
      )}

      {title && (
        <div className="space-y-6">
          <div className="flex gap-6">
            {title.image_url ? (
              <img
                src={title.image_url}
                alt={title.name}
                className="w-40 h-60 rounded-lg object-cover shrink-0 shadow-md"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="w-40 h-60 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{title.name}</h1>
                <p className="text-muted-foreground mt-1">
                  {title.type === "series" ? "Series" : "Movie"}{title.year ? ` · ${title.year}` : ""}
                  {title.runtime_minutes ? ` · ${title.runtime_minutes} min` : ""}
                </p>
              </div>

              {/* Ratings with links */}
              <div className="flex items-center gap-3 flex-wrap">
                {title.imdb_rating && (
                  title.imdb_url ? (
                    <a href={title.imdb_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium hover:underline">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {title.imdb_rating} IMDb
                      <ExternalLink className="h-3 w-3 ml-0.5 text-muted-foreground" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {title.imdb_rating} IMDb
                    </div>
                  )
                )}
                {title.rt_rating && (
                  title.rt_url ? (
                    <a href={title.rt_url} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:underline flex items-center gap-1">
                      🍅 {title.rt_rating}%
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">🍅 {title.rt_rating}%</span>
                  )
                )}
              </div>

              {/* Genres - linked to genre pages */}
              <div className="flex flex-wrap gap-1.5">
                {title.genres.map((g) => (
                  <Link key={g} to={`/genre/${encodeURIComponent(g)}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-accent">{g}</Badge>
                  </Link>
                ))}
              </div>

              {title.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{title.description}</p>
              )}

              {/* Director */}
              {title.director && (
                <p className="text-sm"><span className="font-medium">Director:</span> {title.director}</p>
              )}

              {/* Cast - clickable actor cards */}
              {actors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Cast</p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {actors.map((a) => (
                      <Link key={a.id} to={`/actor/${a.id}`} className="shrink-0 w-20 text-center group">
                        {a.image_url ? (
                          <img
                            src={a.image_url}
                            alt={a.name}
                            className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-transparent group-hover:ring-primary transition-all"
                            onError={(e) => {
                              const el = e.target as HTMLImageElement;
                              el.style.display = "none";
                              el.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div className={`w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto ${a.image_url ? "hidden" : ""}`}>
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-medium mt-1 truncate group-hover:text-primary transition-colors">{a.name}</p>
                        {a.character_name && (
                          <p className="text-[10px] text-muted-foreground truncate">{a.character_name}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback: show cast names if no actor objects yet */}
              {actors.length === 0 && title.cast_members && title.cast_members.length > 0 && !enriching && (
                <p className="text-sm"><span className="font-medium">Cast:</span> {title.cast_members.join(", ")}</p>
              )}

              {enriching && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading more details…
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              {userStatus ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Your status: <Badge variant="outline">{userStatus.replace(/_/g, " ")}</Badge>
                    {userRating && <span className="ml-2">· Rated {userRating}/10</span>}
                  </p>
                  <Select value={userStatus} onValueChange={(v) => addToList(v as WatchStatus)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="watched">Watched</SelectItem>
                      <SelectItem value="watching">Watching</SelectItem>
                      <SelectItem value="want_to_watch">Want to Watch</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Add to your list</p>
                  <div className="w-48">
                    <AddToWatchlistSelect
                      titleId={title.id}
                      titleName={title.name}
                      onStatusChange={(status) => setUserStatus(status)}
                      size="default"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  if (user) return <Layout>{content}</Layout>;

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      {content}
    </div>
  );
};

export default TitleDetailPage;
