import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";
import PublicHeader from "@/shared/layout/PublicHeader";
import Layout from "@/shared/layout/Layout";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Star, Loader2 } from "lucide-react";
import AddToWatchlistSelect from "@/features/library/AddToWatchlistSelect";

interface GenreTitle {
  id: string;
  name: string;
  type: "movie" | "series";
  year: number | null;
  genres: string[];
  imdb_rating: number | null;
  image_url: string | null;
  description: string | null;
}

const GenrePage = () => {
  const { genre } = useParams<{ genre: string }>();
  const { user } = useAuth();
  const [titles, setTitles] = useState<GenreTitle[]>([]);
  const [loading, setLoading] = useState(true);

  const decodedGenre = decodeURIComponent(genre || "");

  useEffect(() => {
    if (decodedGenre) loadTitles();
  }, [decodedGenre]);

  const loadTitles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("titles")
      .select("id, name, type, year, genres, imdb_rating, image_url, description")
      .contains("genres", [decodedGenre])
      .order("imdb_rating", { ascending: false, nullsFirst: false })
      .limit(50);

    if (!error && data) {
      setTitles(data as GenreTitle[]);
    }
    setLoading(false);
  };

  const content = (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Browse by genre</p>
        <h1 className="text-3xl font-bold tracking-tight">
          Top {decodedGenre} watches by our users
        </h1>
        <p className="text-muted-foreground mt-2">
          {decodedGenre} movies and series tracked by the Qeued community.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : titles.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No titles found for this genre yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {titles.map((t) => (
              <Card key={t.id} className="overflow-hidden hover:shadow-md transition-shadow h-full">
                <CardContent className="p-0">
                  <div className="flex gap-3 p-4">
                    <Link to={`/title/${t.id}`} className="shrink-0">
                      {t.image_url ? (
                        <img
                          src={t.image_url}
                          alt={t.name}
                          className="h-28 w-[4.5rem] rounded object-cover"
                        />
                      ) : (
                        <div className="h-28 w-[4.5rem] rounded bg-muted flex items-center justify-center">
                          <Star className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/title/${t.id}`}>
                        <p className="font-semibold text-sm truncate hover:underline">{t.name}</p>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {t.type === "series" ? "Series" : "Movie"}{t.year ? ` · ${t.year}` : ""}
                        </span>
                        {t.imdb_rating && (
                          <span className="flex items-center gap-0.5 text-xs">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {t.imdb_rating}
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{t.description}</p>
                      )}
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {t.genres.slice(0, 3).map((g) => (
                          <Badge key={g} variant="secondary" className="text-[10px] px-1.5 py-0">{g}</Badge>
                        ))}
                      </div>
                      <div className="mt-2">
                        <AddToWatchlistSelect
                          titleId={t.id}
                          titleName={t.name}
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

export default GenrePage;
