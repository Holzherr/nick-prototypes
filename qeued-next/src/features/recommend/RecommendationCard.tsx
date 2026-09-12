import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Star, X, SkipForward } from "lucide-react";
import { supabase } from "@/shared/supabase/client";
import { useToast } from "@/shared/components/ui/use-toast";
import AddToWatchlistSelect from "@/features/library/AddToWatchlistSelect";
import { useProfile } from "@/features/household/ProfileContext";

export interface Recommendation {
  /** Present for anything out of our catalogue, which is everything the engine returns now. */
  title_id?: string;
  slug?: string | null;
  title: string;
  genres: string[];
  imdb_rating: number;
  match_score: number;
  explanation: string;
  type: string;
  year: number;
  image_url?: string | null;
  certification?: string | null;
  runtime_minutes?: number | null;
  /** Where it streams in the UK, already loaded — no lookup on render. */
  providers?: string[];
}

type CardState = "default" | "rating" | "saving";

interface Props {
  rec: Recommendation;
  shared?: boolean;
  userId: string;
  onRemoved: () => void;
  onNeedMore: () => void;
}

const RecommendationCard = ({ rec, userId, onRemoved, onNeedMore }: Props) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { active } = useProfile();
  const [state, setState] = useState<CardState>("default");
  const [saving, setSaving] = useState(false);

  /**
   * Recommendations come out of the catalogue and carry their own id, so this costs nothing.
   * The name lookup is a fallback for anything cached before the engine started returning
   * ids — it is a round trip, which is why the engine no longer produces bare names.
   */
  const ensureTitleId = async (): Promise<string | null> => {
    if (rec.title_id) return rec.title_id;
    const { data } = await supabase.from("titles").select("id").ilike("name", rec.title).limit(1).maybeSingle();
    return data?.id ?? null;
  };

  const goToTitle = async () => {
    const titleId = await ensureTitleId();
    if (titleId) {
      navigate(`/title/${titleId}`);
      return;
    }
    toast({ title: "Not in the catalogue yet", description: rec.title });
  };

  const submitRating = async (rating: number) => {
    setSaving(true);
    try {
      const titleId = await ensureTitleId();
      if (!titleId || !active) return;

      await supabase.from("watch_entries").upsert(
        {
          profile_id: active.id,
          user_id: userId,
          title_id: titleId,
          status: "watched",
          watched_rating: rating,
          watched_date: new Date().toISOString().slice(0, 10),
        },
        { onConflict: "profile_id,title_id" },
      );

      toast({ title: `Rated ${rating}/5`, description: rec.title });
      onRemoved();
      onNeedMore();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const skipRating = () => {
    toast({ title: "Marked as watched", description: rec.title });
    onRemoved();
    onNeedMore();
  };

  const skipRecommendation = async () => {
    setSaving(true);
    try {
      await supabase.from("skipped_recommendations").upsert(
        { user_id: userId, title_name: rec.title.toLowerCase() },
        { onConflict: "user_id,title_name" }
      );
      onRemoved();
      onNeedMore();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Rating view after marking as watched
  if (state === "rating") {
    return (
      <Card className="border-primary/30 bg-primary/5 transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-base leading-tight cursor-pointer hover:underline" onClick={goToTitle}>{rec.title}</CardTitle>
          <p className="text-xs text-muted-foreground">{rec.type} · {rec.year}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-medium">How would you rate it?</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
              <Button
                key={n}
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-xs hover:bg-primary hover:text-primary-foreground"
                onClick={() => submitRating(n)}
                disabled={saving}
              >
                {n}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground"
            onClick={skipRating}
            disabled={saving}
          >
            <SkipForward className="h-3 w-3 mr-1" />
            Skip rating
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default view
  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      {rec.image_url && (
        <div
          role="link"
          tabIndex={0}
          onClick={goToTitle}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); void goToTitle(); } }}
          className="relative w-full h-44 cursor-pointer bg-muted"
        >
          <img
            src={rec.image_url}
            alt={rec.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
            <div>
              <CardTitle className="text-base leading-tight text-foreground drop-shadow-sm cursor-pointer hover:underline" onClick={goToTitle}>{rec.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{rec.type} · {rec.year}</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium bg-background/70 rounded-full px-2 py-0.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {rec.imdb_rating}
            </div>
          </div>
        </div>
      )}
      {!rec.image_url && (
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base leading-tight cursor-pointer hover:underline" onClick={goToTitle}>{rec.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{rec.type} · {rec.year}</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {rec.imdb_rating}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={`space-y-2.5 ${rec.image_url ? 'pt-3' : ''}`}>
        <div className="flex flex-wrap gap-1">
          {rec.genres.slice(0, 3).map((g) => (
            <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">{rec.match_score}% match</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{rec.explanation}</p>
        {rec.providers?.length ? (
          <p className="truncate text-xs text-muted-foreground">On {rec.providers.slice(0, 3).join(", ")}</p>
        ) : null}
        <div className="flex gap-1.5 pt-1 items-center">
          <div className="flex-1 min-w-0">
            <AddToWatchlistSelect
              titleName={rec.title}
              titleId={rec.title_id}
              resolveTitleId={ensureTitleId}
              onStatusChange={(status) => {
                if (status === "watched") {
                  setState("rating");
                } else {
                  onRemoved();
                  onNeedMore();
                }
              }}
              size="sm"
            />
          </div>
          <Button size="sm" variant="ghost" onClick={skipRecommendation} disabled={saving} className="h-8 w-8 p-0 shrink-0 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
