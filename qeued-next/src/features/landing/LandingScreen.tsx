import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";
import PublicHeader from "@/shared/layout/PublicHeader";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Star, Loader2, ArrowRight, Users } from "lucide-react";
import AddToWatchlistSelect from "@/features/library/AddToWatchlistSelect";

interface PopularTitle {
  title: string;
  type: "movie" | "series";
  year: number;
  genres: string[];
  imdb_rating: number;
  description: string;
  image_url: string | null;
}

interface PublicProfile {
  user_id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
}

const LandingPage = () => {
  const { loading: authLoading } = useAuth();
  const [titles, setTitles] = useState<PopularTitle[]>([]);
  const [people, setPeople] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopular();
  }, []);

  const loadPopular = async () => {
    try {
      const [popularRes, peopleRes] = await Promise.all([
        supabase.functions.invoke("get-popular", { body: {} }),
        supabase
          .from("profiles")
          .select("user_id, name, username, avatar_url")
          .eq("is_public", true)
          .not("username", "is", null)
          .order("created_at", { ascending: false })
          .limit(8),
      ]);
      if (popularRes.data?.titles) setTitles(popularRes.data.titles);
      if (peopleRes.data) setPeople(peopleRes.data as PublicProfile[]);
    } catch (e) {
      console.error("Failed to load landing data", e);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero - brief value prop */}
      <section className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Track what you watch.
          <br />
          <span className="text-primary">Discover what's next.</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Log movies & series, get AI-powered recommendations, and share your taste with friends.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Get started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Popular right now */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="text-2xl font-semibold mb-6">🔥 Popular right now</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {titles.map((t, i) => (
              <Card key={`${t.title}-${i}`} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex gap-3 p-4">
                    {t.image_url ? (
                      <img
                        src={t.image_url}
                        alt={t.title}
                        className="h-24 w-16 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-24 w-16 rounded bg-muted flex items-center justify-center shrink-0">
                        <Star className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {t.type === "series" ? "Series" : "Movie"} · {t.year}
                        </span>
                        {t.imdb_rating && (
                          <span className="flex items-center gap-0.5 text-xs">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {t.imdb_rating}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                        {t.description}
                      </p>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {t.genres.slice(0, 3).map((g) => (
                          <span key={g} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                            {g}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2">
                        <AddToWatchlistSelect
                          titleName={t.title}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Explore people */}
      {people.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> People on Qeued
            </h2>
            <Link to="/explore" className="text-sm text-primary hover:underline font-medium">
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {people.map((p) => (
              <Link
                key={p.user_id}
                to={`/p/${p.username}`}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {(p.name || p.username || "?")[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{p.name || p.username}</p>
                  <p className="text-xs text-muted-foreground">@{p.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;
