import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, Tv, Film } from "lucide-react";
import { supabase } from "@/shared/supabase/client";
import PublicHeader from "@/shared/layout/PublicHeader";

type Entry = {
  position: number;
  note: string | null;
  titles: {
    slug: string; name: string; year: number | null; type: string;
    image_url: string | null; genres: string[] | null; runtime_minutes: number | null;
  } | null;
};
type List = { id: string; slug: string; name: string; blurb: string | null; kind: string; facet: string | null };

/** One list, in its order. The order is the claim, so it is shown rather than implied. */
const ListScreen = () => {
  const { slug } = useParams<{ slug: string }>();
  const [list, setList] = useState<List | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("title_lists")
        .select("id, slug, name, blurb, kind, facet")
        .eq("slug", slug!)
        .eq("published", true)
        .maybeSingle();
      setList((data ?? null) as List | null);

      if (data) {
        const { data: rows } = await supabase
          .from("title_list_entries")
          .select("position, note, titles(slug, name, year, type, image_url, genres, runtime_minutes)")
          .eq("list_id", (data as List).id)
          .order("position", { ascending: true });
        setEntries((rows ?? []) as unknown as Entry[]);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  if (!list) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-xl font-semibold">No list at that address</h1>
          <p className="mt-2 text-muted-foreground"><Link to="/lists" className="underline">All lists</Link></p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <header>
          <Link to="/lists" className="text-sm text-muted-foreground underline">All lists</Link>
          <h1 className="mt-2 text-2xl font-bold">{list.name}</h1>
          {list.blurb && <p className="mt-2 max-w-prose text-muted-foreground">{list.blurb}</p>}
        </header>

        <ol className="space-y-4">
          {entries.map((entry) => {
            const title = entry.titles;
            if (!title) return null;
            return (
              <li key={title.slug} className="flex gap-4">
                <span className="w-8 shrink-0 pt-1 text-right text-lg font-semibold tabular-nums text-muted-foreground">
                  {entry.position}
                </span>
                <Link to={`/titles/${title.slug}`} className="flex min-w-0 flex-1 gap-4 rounded-lg p-2 hover:bg-muted">
                  {title.image_url ? (
                    <img src={title.image_url} alt="" className="h-24 w-16 shrink-0 rounded object-cover" />
                  ) : (
                    <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded bg-muted">
                      {title.type === "series" ? <Tv className="h-5 w-5 text-muted-foreground" /> : <Film className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium">
                      {title.name} {title.year && <span className="font-normal text-muted-foreground">({title.year})</span>}
                    </p>
                    {entry.note && <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        {!entries.length && <p className="text-muted-foreground">This list is empty.</p>}
      </main>
    </div>
  );
};

export default ListScreen;
