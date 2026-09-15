import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/shared/supabase/client";
import PublicHeader from "@/shared/layout/PublicHeader";

type List = { slug: string; name: string; blurb: string | null; kind: string; facet: string | null; position: number };

/** The order the groups appear in, and what to call them. */
const GROUPS: { kind: string; heading: string; note: string }[] = [
  { kind: "pick", heading: "Where to start", note: "A few ways in, if you don't know what you're after." },
  { kind: "year", heading: "By year", note: "The best of each year, as we see it." },
  { kind: "decade", heading: "By decade", note: "Ten years at a time." },
  { kind: "genre", heading: "By kind", note: "Sorted by what it is, then by how good it is." },
  { kind: "place", heading: "By place", note: "Where it came from." },
];

/**
 * The browsing index. A watchlist app is a browsing surface before it is a search one, and
 * "what should we watch" is answered better by a list somebody wrote than by a filter.
 */
const ListsIndexScreen = () => {
  const [lists, setLists] = useState<List[] | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("title_lists")
        .select("slug, name, blurb, kind, facet, position")
        .eq("published", true)
        .order("position", { ascending: true })
        .limit(500);
      setLists((data ?? []) as List[]);
    })();
  }, []);

  if (!lists) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        <header>
          <h1 className="text-2xl font-bold">Lists</h1>
          <p className="mt-2 max-w-prose text-muted-foreground">
            These are not rankings by score — qeued has no crowd to average and will not borrow
            anybody else's. They are positions somebody took, in an order that means something.
          </p>
        </header>

        {GROUPS.map((group) => {
          const inGroup = lists.filter((list) => list.kind === group.kind);
          if (!inGroup.length) return null;
          return (
            <section key={group.kind}>
              <h2 className="text-lg font-semibold">{group.heading}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{group.note}</p>
              {/* Year lists are short names and there are dozens, so they read better as a
                  dense row of links than as a column of cards. */}
              {group.kind === "year" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {inGroup.map((list) => (
                    <Link
                      key={list.slug}
                      to={`/lists/${list.slug}`}
                      className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                    >
                      {list.facet ?? list.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <ul className="mt-3 space-y-3">
                  {inGroup.map((list) => (
                    <li key={list.slug}>
                      <Link to={`/lists/${list.slug}`} className="block rounded-lg border p-4 hover:bg-muted">
                        <span className="font-medium">{list.name}</span>
                        {list.blurb && <span className="mt-1 block text-sm text-muted-foreground">{list.blurb}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}

        {!lists.length && <p className="text-muted-foreground">No lists yet.</p>}
      </main>
    </div>
  );
};

export default ListsIndexScreen;
