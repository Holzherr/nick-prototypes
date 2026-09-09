import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Star, X, SkipForward } from "lucide-react";
import { supabase } from "@/shared/supabase/client";
import { useToast } from "@/shared/components/ui/use-toast";
import AddToWatchlistSelect from "@/features/library/AddToWatchlistSelect";

export interface Recommendation {
  title: string;
  genres: string[];
  imdb_rating: number;
  match_score: number;
  explanation: string;
  type: string;
  year: number;
  image_url?: string;
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
  const [state, setState] = useState<CardState>("default");
  const [saving, setSaving] = useState(false);

  const resolveTitleId = async (): Promise<string | null> => {
    // Try exact match first
    const { data: existing } = await supabase
      .from("titles")
      .select("id")
      .ilike("name", rec.title)
      .limit(1)
      .single();

    if (existing?.id) return existing.id;

    // Use search to create the title in DB via AI
    const { data } = await supabase.functions.invoke("search-titles", {
      body: { query: rec.title },
    });

    const titles = data?.titles || [];
    // Try exact match first, then partial match
    const exact = titles.find(
      (t: any) => t.name?.toLowerCase() === rec.title.toLowerCase()
    );
    if (exact?.id) return exact.id;

    // Take first result if available (AI searched for this title)
    if (titles.length > 0 && titles[0]?.id) return titles[0].id;

    return null;
  };

  const goToTitle = async () => {
    const titleId = await resolveTitleId();
    if (titleId) navigate(`/title/${titleId}`);
  };

  const submitRating = async (rating: number) => {
    setSaving(true);
    try {
      const titleId = await resolveTitleId();
      if (!titleId) return;

      await supabase
        .from("watch_entries")
        .update({ watched_rating: rating })
        .eq("user_id", userId)
        .eq("title_id", titleId);

      toast({ title: `Rated ${rating}/10`, description: rec.title });
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
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
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
        <div className="relative w-full h-44 bg-muted">
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
        <div className="flex gap-1.5 pt-1 items-center">
          <div className="flex-1 min-w-0">
            <AddToWatchlistSelect
              titleName={rec.title}
              resolveTitleId={resolveTitleId}
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
