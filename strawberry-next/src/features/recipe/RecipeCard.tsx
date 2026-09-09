import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { type DbRecipe } from "@/shared/api";
import { useApp } from "@/app/AppContext";

export default function RecipeCard({ recipe, priority = false }: { recipe: DbRecipe; priority?: boolean }) {
  const { savedRecipeIds, toggleSaveRecipe } = useApp();
  const saved = savedRecipeIds.includes(recipe.id);

  return (
    <div className="group">
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          {recipe.photo_url && (
            <img
              src={recipe.photo_url}
              alt={recipe.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority ? "high" : "auto"}
              sizes="(min-width: 768px) 33vw, 50vw"
            />
          )}
        </div>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/recipe/${recipe.id}`}>
            <h3 className="font-medium text-sm leading-snug truncate">{recipe.title}</h3>
          </Link>
          <Link to={`/@${recipe.author_handle}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            @{recipe.author_handle}
          </Link>
        </div>
        <button
          onClick={() => toggleSaveRecipe(recipe.id)}
          className="shrink-0 p-1 -mr-1 transition-transform active:scale-95"
          aria-label={saved ? "Unsave recipe" : "Save recipe"}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-foreground" : ""}`} strokeWidth={1.5} />
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground mt-0.5">
        {recipe.save_count || 0} saves · {recipe.cook_time}
      </p>
    </div>
  );
}
