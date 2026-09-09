import { useParams, Link } from "react-router-dom";
import { Bookmark, Share2, ShoppingCart, ArrowLeft, UserPlus, UserMinus, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { fetchRecipeById, type DbRecipe } from "@/shared/api";
import { useApp } from "@/app/AppContext";
import { useAuth } from "@/features/auth/AuthContext";
import { supabase } from "@/shared/supabase/client";
import { toast } from "sonner";

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<DbRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const { savedRecipeIds, toggleSaveRecipe, addToShoppingList } = useApp();
  const { user, profile } = useAuth();

  const isOwnRecipe = user && profile?.handle && recipe?.author_handle === profile.handle;
  const canClaim = user && profile?.handle && recipe && !isOwnRecipe;
  const canUnclaim = user && profile?.handle && recipe && isOwnRecipe;

  const handlePublishToProfile = async () => {
    if (!recipe || !profile?.handle || !profile?.display_name) {
      toast.error("Please set a handle and display name in your profile first");
      return;
    }
    const { error } = await supabase
      .from("recipes")
      .update({ author_handle: profile.handle, author_name: profile.display_name })
      .eq("id", recipe.id);
    if (error) {
      toast.error("Failed to publish to profile");
    } else {
      setRecipe({ ...recipe, author_handle: profile.handle, author_name: profile.display_name });
      toast.success("Recipe published to your profile!");
    }
  };

  const handleUnpublishFromProfile = async () => {
    if (!recipe) return;
    const { error } = await supabase
      .from("recipes")
      .update({ author_handle: "anon", author_name: "Anonymous" })
      .eq("id", recipe.id);
    if (error) {
      toast.error("Failed to unpublish");
    } else {
      setRecipe({ ...recipe, author_handle: "anon", author_name: "Anonymous" });
      toast.success("Recipe unpublished from your profile");
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchRecipeById(id)
      .then(setRecipe)
      .catch(() => setRecipe(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-6">
        <div className="aspect-[3/2] rounded-xl bg-muted animate-pulse mb-6" />
        <div className="h-6 bg-muted rounded animate-pulse w-2/3 mb-3" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Recipe not found.</p>
        <Link to="/" className="text-sm underline mt-4 inline-block">Back to Discover</Link>
      </div>
    );
  }

  const saved = savedRecipeIds.includes(recipe.id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Link copied to clipboard");
  };

  const handleAddToList = () => {
    addToShoppingList(
      recipe.ingredients.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        category: i.category,
        recipe_id: recipe.id,
      }))
    );
    toast(`${recipe.ingredients.length} items added to shopping list`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="aspect-[3/2] overflow-hidden rounded-xl bg-muted mb-6">
        {recipe.photo_url && (
          <img src={recipe.photo_url} alt={recipe.title} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-2xl font-semibold tracking-tight leading-tight">{recipe.title}</h1>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => toggleSaveRecipe(recipe.id)} className="p-2 rounded-full hover:bg-secondary transition-colors active:scale-95" aria-label="Save">
            <Bookmark className={`h-5 w-5 ${saved ? "fill-foreground" : ""}`} strokeWidth={1.5} />
          </button>
          <button onClick={handleShare} className="p-2 rounded-full hover:bg-secondary transition-colors active:scale-95" aria-label="Share">
            <Share2 className="h-5 w-5" strokeWidth={1.5} />
          </button>
          {canClaim && (
            <button onClick={handlePublishToProfile} className="p-2 rounded-full hover:bg-secondary transition-colors active:scale-95" aria-label="Publish to profile" title="Publish to my profile">
              <UserPlus className="h-5 w-5" strokeWidth={1.5} />
            </button>
          )}
          {canUnclaim && (
            <button onClick={handleUnpublishFromProfile} className="p-2 rounded-full hover:bg-secondary transition-colors active:scale-95 text-destructive" aria-label="Unpublish from profile" title="Unpublish from my profile">
              <UserMinus className="h-5 w-5" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      <p className="text-muted-foreground text-sm mb-4">{recipe.description}</p>

      <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground mb-8">
        <Link to={`/@${recipe.author_handle}`} className="hover:text-foreground transition-colors">
          @{recipe.author_handle}
        </Link>
        <span>{recipe.servings} servings</span>
        <span>{recipe.cook_time}</span>
        <span>{recipe.cuisine}</span>
        {recipe.calories != null && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                <Flame className="h-3 w-3" />
                {recipe.calories} kcal
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Protein", value: recipe.protein?.toFixed(0), unit: "g" },
                  { label: "Carbs", value: recipe.carbs?.toFixed(0), unit: "g" },
                  { label: "Fat", value: recipe.fat?.toFixed(0), unit: "g" },
                  { label: "Fiber", value: recipe.fiber?.toFixed(0), unit: "g" },
                  { label: "Sugar", value: recipe.sugar?.toFixed(0), unit: "g" },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <div className="text-sm font-medium">{m.value}{m.unit}</div>
                    <div className="text-[10px] text-muted-foreground">{m.label}</div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium">Ingredients</h2>
          <button
            onClick={handleAddToList}
            className="inline-flex items-center gap-1.5 text-xs border rounded-full px-3 py-1.5 hover:bg-secondary transition-colors active:scale-[0.97]"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Add all to list
          </button>
        </div>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-baseline justify-between text-sm border-b border-dashed pb-2 last:border-0">
              <span>{ing.name}</span>
              <span className="text-muted-foreground text-xs">{ing.quantity}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-base font-medium mb-3">Method</h2>
        <ol className="space-y-4">
          {(recipe.steps || []).map((step, i) => (
            <li key={i} className="flex gap-4 text-sm">
              <span className="shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium text-muted-foreground">
                {i + 1}
              </span>
              <p className="leading-relaxed pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
