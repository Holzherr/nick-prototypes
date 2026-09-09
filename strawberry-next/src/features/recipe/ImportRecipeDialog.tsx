import { useState } from "react";
import { Link2, Loader2 } from "lucide-react";
import { supabase } from "@/shared/supabase/client";
import { useApp } from "@/app/AppContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ParsedRecipe {
  title: string;
  description: string;
  author_name: string;
  servings: number;
  cook_time: string;
  cuisine: string;
  diet_tags: string[];
  photo_url: string | null;
  ingredients: { name: string; quantity: string; category: string }[];
  steps: string[];
}

export default function ImportRecipeDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedRecipe | null>(null);
  const [saving, setSaving] = useState(false);
  const { toggleSaveRecipe, refreshAll } = useApp();
  const navigate = useNavigate();

  if (!open) return null;

  const handleParse = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setParsed(null);
    try {
      const { data, error } = await supabase.functions.invoke("parse-recipe-url", {
        body: { url: url.trim() },
      });
      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setParsed(data.recipe);
    } catch (e: any) {
      toast.error(e.message || "Failed to parse recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!parsed) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from("recipes").insert({
        title: parsed.title,
        description: parsed.description,
        author_name: parsed.author_name,
        author_handle: "imported",
        servings: parsed.servings,
        cook_time: parsed.cook_time,
        cuisine: parsed.cuisine,
        diet_tags: parsed.diet_tags,
        photo_url: parsed.photo_url,
        ingredients: parsed.ingredients as any,
        steps: parsed.steps,
        is_draft: false,
      }).select("id").single();
      if (error) throw error;

      // Auto-save to recipe box
      await toggleSaveRecipe(data.id);
      await refreshAll();
      toast.success("Recipe imported and saved!");
      onClose();
      setParsed(null);
      setUrl("");
      navigate(`/recipe/${data.id}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    onClose();
    setParsed(null);
    setUrl("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-background border rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Import recipe from URL</h2>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/recipe/..."
              className="w-full border rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleParse()}
              autoFocus
            />
          </div>
          <button
            onClick={handleParse}
            disabled={loading || !url.trim()}
            className="shrink-0 bg-foreground text-background text-sm font-medium px-4 py-2 rounded-full hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Parse"}
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching and parsing recipe…
          </div>
        )}

        {parsed && (
          <div className="space-y-4">
            {parsed.photo_url && (
              <div className="aspect-[3/2] rounded-lg overflow-hidden bg-muted">
                <img src={parsed.photo_url} alt={parsed.title} className="h-full w-full object-cover" />
              </div>
            )}

            <div>
              <h3 className="font-semibold text-base">{parsed.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{parsed.description}</p>
              <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                <span>{parsed.author_name}</span>
                {parsed.cook_time && <span>· {parsed.cook_time}</span>}
                {parsed.cuisine && <span>· {parsed.cuisine}</span>}
                {parsed.servings && <span>· {parsed.servings} servings</span>}
              </div>
              {parsed.diet_tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {parsed.diet_tags.map((t) => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded-full border">{t}</span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Ingredients ({parsed.ingredients.length})</h4>
              <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                {parsed.ingredients.map((ing, i) => (
                  <li key={i} className="flex justify-between border-b border-dashed pb-1 last:border-0">
                    <span>{ing.name}</span>
                    <span className="text-muted-foreground text-xs">{ing.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Steps ({parsed.steps.length})</h4>
              <ol className="text-sm space-y-1 max-h-32 overflow-y-auto list-decimal list-inside">
                {parsed.steps.map((s, i) => (
                  <li key={i} className="text-muted-foreground">{s}</li>
                ))}
              </ol>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-foreground text-background text-sm font-medium py-2.5 rounded-full hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save to Recipe Box"}
            </button>
          </div>
        )}

        <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-sm">
          ✕
        </button>
      </div>
    </div>
  );
}
