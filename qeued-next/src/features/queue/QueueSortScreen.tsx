import { useCallback, useEffect, useState } from "react";
import { Loader2, Check, Shuffle } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { supabase } from "@/shared/supabase/client";
import { useProfile } from "@/features/household/ProfileContext";
import { type Duel, nextDuel, rankFromDuels } from "./model";

type QueueItem = {
  entry_id: string;
  title_id: string;
  name: string;
  year: number | null;
  image_url: string | null;
  genres: string[];
};

/**
 * Orders the queue by asking "this or that".
 *
 * The 1-to-10 desire dropdown this replaces went unused on every single entry — it asked
 * for a number nobody has. A comparison is a question people can answer instantly, and a
 * handful of them orders the whole list.
 */
const QueueSortScreen = () => {
  const { active } = useProfile();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [duels, setDuels] = useState<Duel[]>([]);
  const [pair, setPair] = useState<[string, string] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!active) return;
    const [{ data: entries }, { data: recorded }] = await Promise.all([
      supabase
        .from("watch_entries")
        .select("id, title_id, titles(name, year, image_url, genres)")
        .eq("profile_id", active.id)
        .eq("status", "want_to_watch"),
      supabase.from("queue_duels").select("winner_title_id, loser_title_id").eq("profile_id", active.id),
    ]);

    const queue: QueueItem[] = (entries ?? []).map((e) => ({
      entry_id: e.id as string,
      title_id: e.title_id as string,
      name: e.titles?.name ?? "",
      year: e.titles?.year ?? null,
      image_url: e.titles?.image_url ?? null,
      genres: e.titles?.genres ?? [],
    }));

    setItems(queue);
    setDuels((recorded ?? []) as Duel[]);
    setPair(nextDuel(queue.map((q) => q.title_id), (recorded ?? []) as Duel[]));
    setLoading(false);
  }, [active]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Record the choice, re-rank locally, and persist the new order. */
  const choose = async (winner: string, loser: string) => {
    if (!active) return;
    setSaving(true);
    const next = [...duels, { winner_title_id: winner, loser_title_id: loser }];
    setDuels(next);
    setPair(nextDuel(items.map((q) => q.title_id), next));

    await supabase.from("queue_duels").insert({
      profile_id: active.id,
      winner_title_id: winner,
      loser_title_id: loser,
    } as never);

    const strength = rankFromDuels(items.map((q) => q.title_id), next);
    await Promise.all(
      items.map((item) =>
        supabase.from("watch_entries").update({ queue_rank: strength.get(item.title_id) ?? 1 }).eq("id", item.entry_id),
      ),
    );
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  if (items.length < 2) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Order your list</h1>
        <p className="text-muted-foreground">Add a couple more things and this becomes useful.</p>
      </div>
    );
  }

  const strength = rankFromDuels(items.map((q) => q.title_id), duels);
  const ordered = [...items].sort((a, b) => (strength.get(b.title_id) ?? 1) - (strength.get(a.title_id) ?? 1));
  const contenders = pair?.map((id) => items.find((q) => q.title_id === id)).filter(Boolean) as QueueItem[] | undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Order your list</h1>
        <p className="text-muted-foreground">Pick the one you'd rather watch. A few taps sorts the lot.</p>
      </div>

      {contenders?.length === 2 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {contenders.map((item, i) => (
            <button
              key={item.title_id}
              type="button"
              disabled={saving}
              onClick={() => choose(item.title_id, contenders[1 - i].title_id)}
              className="group flex flex-col overflow-hidden rounded-lg border text-left transition hover:border-primary disabled:opacity-60"
            >
              {item.image_url ? (
                <img src={item.image_url} alt="" className="h-56 w-full object-cover" />
              ) : (
                <div className="h-56 w-full bg-muted" />
              )}
              <span className="p-3">
                <span className="block font-semibold">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.year}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <Card className="flex items-center gap-3 p-4">
          <Check className="h-5 w-5 text-primary" />
          <p className="text-sm">Everything's been compared. Your order is below.</p>
        </Card>
      )}

      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <Shuffle className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Your order</h2>
          <Badge variant="secondary">{duels.length} comparison{duels.length === 1 ? "" : "s"}</Badge>
        </div>
        <ol className="space-y-1">
          {ordered.map((item, i) => (
            <li key={item.title_id} className="flex items-baseline gap-3 text-sm">
              <span className="w-5 shrink-0 font-mono text-muted-foreground">{i + 1}</span>
              <span className="font-medium">{item.name}</span>
              <span className="text-muted-foreground">{item.year}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default QueueSortScreen;
