import { useState } from "react";
import { Clapperboard, Loader2, Sparkles, Clock, Tv, Film } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { useToast } from "@/shared/components/ui/use-toast";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";
import { useProfile } from "@/features/household/ProfileContext";
import { cn } from "@/shared/utils/cn";

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

const TonightScreen = () => {
  const { user } = useAuth();
  const { active } = useProfile();
  const { toast } = useToast();
  const [mood, setMood] = useState<string>("intense");
  const [length, setLength] = useState<string>("short");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TonightResult | null>(null);

  const decide = async () => {
    if (!user || !active) return;
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("watch-tonight", {
      body: { user_id: user.id, profile_id: active.id, mood, time: length },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't work that out", description: error.message, variant: "destructive" });
      return;
    }
    setResult(data as TonightResult);
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
        <Button onClick={decide} disabled={loading} className="w-full sm:w-auto">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {result ? "Try again" : "Decide for me"}
        </Button>
      </div>

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
    </div>
  );
};

export default TonightScreen;
