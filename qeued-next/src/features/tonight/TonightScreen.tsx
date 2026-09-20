import { useEffect, useMemo, useState } from "react";
import { Clapperboard, Loader2, Sparkles, Clock, Tv, Film } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { useToast } from "@/shared/components/ui/use-toast";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";
import { useProfile } from "@/features/household/ProfileContext";
import { cn } from "@/shared/utils/cn";
import { TONIGHT_SELECT, rankTonight, type TonightEntry } from "./fastTonight";
import { readSlate, writeSlate } from "./slateCache";

export type TonightPick = {
  title: string;
  type: "movie" | "series";
  year: number;
  genres: string[];
  imdb_rating: number;
  explanation: string;
  pick_type: "best" | "safe" | "wildcard";
  in_queue: boolean;
  providers: { provider: string; offer_type: string; url?: string | null }[];
  runtime_minutes?: number | null;
  image_url?: string | null;
  title_id?: string | null;
};

export type TonightResult = {
  picks: TonightPick[];
  queue_size: number;
  ranked_queue: { title: string; title_id?: string; score: number; explanation: string }[];
  /** False when ranked on the device from saved data alone; true once the model has scored it. */
  scored?: boolean;
};

const moods = [
  { key: "intense", label: "Gripping" },
  { key: "easy", label: "Easy" },
  { key: "smart", label: "Thoughtful" },
  { key: "funny", label: "Funny" },
] as const;

const lengths = [
  { key: "short", label: "Short night", icon: Clock },
  { key: "long", label: "Got time", icon: Clapperboard },
] as const;

const pickLabels: Record<TonightPick["pick_type"], string> = {
  best: "Put this on",
  safe: "Or this",
  wildcard: "Off-list",
};

const offerLabel = (offer: string) =>
  offer === "subscription" ? "included" : offer === "free" ? "free" : offer;

/** A pick, with the thing the old app never told you: where you can actually watch it. */
export const PickCard = ({ pick, emphasis }: { pick: TonightPick; emphasis?: boolean }) => (
  <Card className={cn("flex gap-4 p-4", emphasis && "border-primary/40 bg-primary/5")}>
    {pick.image_url ? (
      <img src={pick.image_url} alt="" className="h-28 w-20 shrink-0 rounded object-cover" />
    ) : (
      <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded bg-muted">
        {pick.type === "series" ? <Tv className="h-6 w-6 text-muted-foreground" /> : <Film className="h-6 w-6 text-muted-foreground" />}
      </div>
    )}
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Badge variant={emphasis ? "default" : "secondary"}>{pickLabels[pick.pick_type]}</Badge>
        {!pick.in_queue && <Badge variant="outline">not on your list</Badge>}
      </div>
      <h3 className="truncate font-semibold">
        {pick.title} <span className="font-normal text-muted-foreground">({pick.year})</span>
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{pick.explanation}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {pick.runtime_minutes ? <span>{pick.runtime_minutes} min</span> : null}
        {pick.providers.length ? (
          pick.providers.slice(0, 4).map((p) => (
            <Badge key={`${p.provider}-${p.offer_type}`} variant="outline" className="font-normal">
              {p.provider} · {offerLabel(p.offer_type)}
            </Badge>
          ))
        ) : (
          <span>Availability not checked yet</span>
        )}
      </div>
    </div>
  </Card>
);

const titles = (r: TonightResult) => r.picks.map((p) => p.title).join("|");

/** `preview` is for stories only: rows to rank in place of the profile's list. */
const TonightScreen = ({ preview }: { preview?: TonightEntry[] } = {}) => {
  const { user } = useAuth();
  const { active } = useProfile();
  const { toast } = useToast();
  const [mood, setMood] = useState<string>("intense");
  const [length, setLength] = useState<string>("short");
  const [loading, setLoading] = useState(false);
  // `fetched` stays null until the list has actually arrived, so a failed or offline read is
  // never mistaken for an empty list; `loadError` holds the message and a retry until it does.
  const [fetched, setFetched] = useState<TonightEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  // A scored slate waits here, under the key it was asked for, until they press for it, so the
  // screen never rearranges itself; `shown` is the one they pressed for.
  const [pending, setPending] = useState<{ key: string; result: TonightResult } | null>(null);
  const [shown, setShown] = useState<{ key: string; result: TonightResult } | null>(null);
  const entries = preview ?? fetched;
  const profileId = active?.id;
  const key = `${profileId}|${mood}|${length}`;

  useEffect(() => {
    if (!profileId || preview) return;
    supabase.from("watch_entries").select(TONIGHT_SELECT).eq("profile_id", profileId)
      .then(({ data, error }) => {
        if (error) {
          setLoadError(error.message);
          return;
        }
        setLoadError(null);
        setFetched((data ?? []) as unknown as TonightEntry[]);
      });
  }, [profileId, preview, attempt]);

  // Nothing waits on the model: a saved scored slate for this key wins, else the list is ranked
  // on the device the moment it, the mood or the length changes.
  const result = useMemo(
    () => (!entries ? null : shown?.key === key ? shown.result : readSlate(key) ?? rankTonight(entries, mood, length)),
    [entries, key, mood, length, shown],
  );

  const decide = async () => {
    if (!user || !active) return;
    const asked = key;
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("watch-tonight", {
      body: { user_id: user.id, profile_id: active.id, mood, time: length },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't work that out", description: error.message, variant: "destructive" });
      return;
    }
    const scored: TonightResult = { ...(data as TonightResult), scored: true };
    // The server's own cache answered with what is already on screen: nothing to offer.
    if (result?.scored && titles(result) === titles(scored)) return writeSlate(asked, scored);
    setPending({ key: asked, result: scored });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tonight</h1>
        <p className="text-muted-foreground">Pick from what you've already chosen.</p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {moods.map((m) => (
            <Button key={m.key} size="sm" variant={mood === m.key ? "default" : "outline"} onClick={() => setMood(m.key)}>
              {m.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {lengths.map(({ key, label, icon: Icon }) => (
            <Button key={key} size="sm" variant={length === key ? "default" : "outline"} onClick={() => setLength(key)}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
        <Button onClick={decide} disabled={loading || !result} className="w-full sm:w-auto">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {result?.scored ? "Try again" : "Sharpen these"}
        </Button>
      </div>

      {pending?.key === key && (
        <button type="button" onClick={() => { writeSlate(key, pending.result); setShown(pending); setPending(null); }} className="flex w-full items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-left transition-colors hover:bg-primary/10">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm font-medium">Sharper picks ready</span>
          <span className="text-sm text-muted-foreground">Tap to see them</span>
        </button>
      )}

      {result && (
        <div className="space-y-4">
          {result.picks.map((pick, i) => (
            <PickCard key={`${pick.title}-${pick.pick_type}`} pick={pick} emphasis={i === 0} />
          ))}

          {result.ranked_queue.length > 2 && (
            <details className="rounded-lg border p-4">
              <summary className="cursor-pointer text-sm font-medium">
                The rest of your list, ranked for tonight ({result.ranked_queue.length})
              </summary>
              <ul className="mt-3 space-y-2">
                {result.ranked_queue.map((item) => (
                  <li key={item.title} className="flex items-baseline gap-3 text-sm">
                    <span className="w-8 shrink-0 font-mono text-muted-foreground">{item.score}</span>
                    <span className="font-medium">{item.title}</span>
                    <span className="truncate text-muted-foreground">{item.explanation}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {result && result.queue_size === 0 && (
        <p className="text-sm text-muted-foreground">
          Nothing on your list yet — add a few things and this gets a lot more useful.
        </p>
      )}

      {loadError && !entries && (
        <div className="space-y-2 rounded-lg border border-destructive/40 p-4 text-sm">
          <p className="font-medium">Couldn't load your list</p>
          <p className="text-muted-foreground">{loadError}</p>
          <Button size="sm" variant="outline" onClick={() => setAttempt((n) => n + 1)}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};

export default TonightScreen;
