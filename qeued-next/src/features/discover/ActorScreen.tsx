import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";
import PublicHeader from "@/shared/layout/PublicHeader";
import Layout from "@/shared/layout/Layout";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, Loader2, User, Star } from "lucide-react";

interface ActorData {
  id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
}

interface ActorTitle {
  id: string;
  name: string;
  type: string;
  year: number | null;
  image_url: string | null;
  imdb_rating: number | null;
  genres: string[];
  character_name: string | null;
}

const ActorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [actor, setActor] = useState<ActorData | null>(null);
  const [titles, setTitles] = useState<ActorTitle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadActor();
  }, [id]);

  const loadActor = async () => {
    const { data: actorData, error } = await supabase
      .from("actors")
      .select("*")
      .eq("id", id!)
      .single();

    if (error || !actorData) {
      setLoading(false);
      return;
    }

    setActor(actorData as ActorData);

    // Get titles this actor appears in
    const { data: titleActors } = await supabase
      .from("title_actors")
      .select("character_name, titles(id, name, type, year, image_url, imdb_rating, genres)")
      .eq("actor_id", id!)
      .order("display_order");

    const actorTitles = (titleActors || [])
      .filter((ta: any) => ta.titles)
      .map((ta: any) => ({
        ...ta.titles,
        character_name: ta.character_name,
      }));

    setTitles(actorTitles);
    setLoading(false);
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

      {!loading && !actor && (
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-2">Actor not found</h1>
          <p className="text-muted-foreground">This actor doesn't exist in our database yet.</p>
        </div>
      )}

      {actor && (
        <div className="space-y-6">
          <div className="flex gap-6">
            {actor.image_url ? (
              <img
                src={actor.image_url}
                alt={actor.name}
                className="w-32 h-40 rounded-lg object-cover shrink-0 shadow-md"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="w-32 h-40 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{actor.name}</h1>
              {actor.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">{actor.bio}</p>
              )}
            </div>
          </div>

          {titles.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Filmography</h2>
              <div className="grid gap-3">
                {titles.map((t) => (
                  <Link key={t.id} to={`/title/${t.id}`}>
                    <Card className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-3 flex items-center gap-3">
                        {t.image_url ? (
                          <img src={t.image_url} alt={t.name} className="w-12 h-16 rounded object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-16 rounded bg-muted flex items-center justify-center shrink-0">
                            <Star className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{t.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.type === "series" ? "Series" : "Movie"}{t.year ? ` · ${t.year}` : ""}
                            {t.character_name ? ` · as ${t.character_name}` : ""}
                          </p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {t.genres.slice(0, 3).map((g) => (
                              <Badge key={g} variant="secondary" className="text-[10px] px-1.5 py-0">{g}</Badge>
                            ))}
                          </div>
                        </div>
                        {t.imdb_rating && (
                          <div className="flex items-center gap-1 text-sm shrink-0">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            {t.imdb_rating}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
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

export default ActorPage;
