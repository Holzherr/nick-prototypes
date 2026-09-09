import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { supabase } from "@/shared/supabase/client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useToast } from "@/shared/components/ui/use-toast";
import { Search, Star, Loader2 } from "lucide-react";

type WatchStatus = "watched" | "watching" | "want_to_watch" | "dropped";

interface TitleResult {
  id?: string;
  name: string;
  type: "movie" | "series";
  genres: string[];
  imdb_rating: number | null;
  rt_rating: number | null;
  description: string | null;
  year: number | null;
  already_added?: boolean;
}

const SearchPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TitleResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("search-titles", {
        body: { query: query.trim() },
      });
      if (error) throw error;
      setResults(data?.titles || []);
    } catch (e: any) {
      toast({ title: "Search failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (title: TitleResult, status: WatchStatus) => {
    if (!title.id || !user) return;

    try {
      const { error } = await supabase.from("watch_entries").upsert(
        { user_id: user.id, title_id: title.id, status },
        { onConflict: "user_id,title_id" }
      );
      if (error) throw error;

      setResults((prev) =>
        prev.map((r) => (r.id === title.id ? { ...r, already_added: true } : r))
      );
      toast({ title: "Added!", description: `${title.name} added as "${status.replace(/_/g, " ")}"` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground mt-1">Find movies and series to add to your watchlist</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for a movie or series..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {results.map((title, i) => (
          <Card key={title.id || i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">
                    {title.id ? (
                      <Link to={`/title/${title.id}`} className="hover:underline">{title.name}</Link>
                    ) : title.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {title.type === "series" ? "Series" : "Movie"} · {title.year}
                  </p>
                </div>
                {title.imdb_rating && (
                  <div className="flex items-center gap-1 text-sm font-medium shrink-0">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {title.imdb_rating}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {title.genres.slice(0, 4).map((g) => (
                  <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                ))}
              </div>
              {title.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{title.description}</p>
              )}
              {title.rt_rating && (
                <p className="text-xs text-muted-foreground">🍅 {title.rt_rating}%</p>
              )}
              {title.already_added ? (
                <Badge variant="outline" className="text-xs">Added ✓</Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <Select onValueChange={(v) => addToWatchlist(title, v as WatchStatus)}>
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="Add to watchlist..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="want_to_watch">Want to Watch</SelectItem>
                      <SelectItem value="watching">Watching</SelectItem>
                      <SelectItem value="watched">Watched</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && results.length === 0 && query && (
        <div className="text-center py-12 text-muted-foreground">
          No results yet. Hit search to find titles.
        </div>
      )}
    </div>
  );
};

export default SearchPage;
