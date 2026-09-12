import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, Tv, Film } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { supabase } from "@/shared/supabase/client";
import PublicHeader from "@/shared/layout/PublicHeader";

type Offer = { provider: string; offer_type: string; url: string | null };
type Source = { field: string; source_url: string; source_name: string | null };
type PublicTitle = {
  id: string;
  name: string;
  year: number | null;
  type: string;
  genres: string[];
  tones: string[] | null;
  themes: string[] | null;
  synopsis: string | null;
  certification: string | null;
  runtime_minutes: number | null;
  seasons: number | null;
  episodes: number | null;
  director: string | null;
  cast_members: string[] | null;
  image_url: string | null;
  title_availability: Offer[];
  title_sources: Source[];
};

const COLUMNS =
  "id, name, year, type, genres, tones, themes, synopsis, certification, runtime_minutes, seasons, episodes, director, cast_members, image_url, title_availability(provider, offer_type, url), title_sources(field, source_url, source_name)";

const offerOrder = ["free", "subscription", "rent", "buy", "cinema"];

/** The public record for one title — readable without an account, and the page agents fetch. */
const PublicTitleScreen = () => {
  const { slug } = useParams<{ slug: string }>();
  const [title, setTitle] = useState<PublicTitle | null>(null);
  const [stats, setStats] = useState<{ watchers: number; average: number | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("titles").select(COLUMNS).eq("slug", slug!).maybeSingle();
      setTitle(data as PublicTitle | null);
      if (data) {
        const { data: entries } = await supabase
          .from("watch_entries")
          .select("watched_rating")
          .eq("title_id", (data as PublicTitle).id)
          .eq("status", "watched");
        const ratings = (entries ?? []).map((e) => e.watched_rating).filter((r): r is number => typeof r === "number");
        // Only show aggregates once they describe a crowd rather than a person.
        const watchers = entries?.length ?? 0;
        setStats(
          watchers >= 3
            ? { watchers, average: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null }
            : null,
        );
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  if (!title) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-xl font-semibold">We don't have that one yet</h1>
          <p className="mt-2 text-muted-foreground">
            <Link to="/" className="underline">Browse Qeued</Link>
          </p>
        </main>
      </div>
    );
  }

  const facts = [
    title.type === "series" ? "Series" : "Film",
    title.certification,
    title.runtime_minutes ? `${title.runtime_minutes} min` : null,
    title.seasons ? `${title.seasons} season${title.seasons > 1 ? "s" : ""}` : null,
    title.episodes ? `${title.episodes} episodes` : null,
  ].filter(Boolean);

  const offers = [...(title.title_availability ?? [])].sort(
    (a, b) => offerOrder.indexOf(a.offer_type) - offerOrder.indexOf(b.offer_type),
  );

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="flex gap-5">
          {title.image_url ? (
            <img src={title.image_url} alt="" className="h-48 w-32 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex h-48 w-32 shrink-0 items-center justify-center rounded-lg bg-muted">
              {title.type === "series" ? <Tv className="h-8 w-8 text-muted-foreground" /> : <Film className="h-8 w-8 text-muted-foreground" />}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">
              {title.name} {title.year && <span className="font-normal text-muted-foreground">({title.year})</span>}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{facts.join(" · ")}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {(title.genres ?? []).map((genre) => <Badge key={genre} variant="secondary">{genre}</Badge>)}
              {/* Our own tags, kept visually distinct from genre because they are a different claim. */}
              {[...(title.tones ?? []), ...(title.themes ?? [])].map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
            {stats && (
              <p className="mt-3 text-sm text-muted-foreground">
                Watched by {stats.watchers} on Qeued{stats.average ? `, averaging ${stats.average}/5` : ""}.
              </p>
            )}
          </div>
        </div>

        {title.synopsis && <p className="leading-relaxed">{title.synopsis}</p>}

        {(title.director || title.cast_members?.length) && (
          <div className="text-sm text-muted-foreground">
            {title.director && <p>Directed by {title.director}</p>}
            {title.cast_members?.length ? <p>Starring {title.cast_members.slice(0, 6).join(", ")}</p> : null}
          </div>
        )}

        <Card className="p-4">
          <h2 className="mb-2 font-semibold">Where to watch (UK)</h2>
          {offers.length ? (
            <ul className="space-y-1 text-sm">
              {offers.map((offer) => (
                <li key={`${offer.provider}-${offer.offer_type}`} className="flex items-center gap-2">
                  <Badge variant="outline">{offer.offer_type === "subscription" ? "included" : offer.offer_type}</Badge>
                  <span>{offer.provider}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Not checked yet.</p>
          )}
        </Card>

        {title.title_sources?.length ? (
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer">Sources</summary>
            <ul className="mt-2 space-y-1">
              {title.title_sources.slice(0, 10).map((source) => (
                <li key={`${source.field}-${source.source_url}`}>
                  <a href={source.source_url} rel="nofollow noreferrer" target="_blank" className="underline">
                    {source.source_name ?? source.source_url}
                  </a>{" "}
                  — {source.field}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </main>
    </div>
  );
};

export default PublicTitleScreen;
