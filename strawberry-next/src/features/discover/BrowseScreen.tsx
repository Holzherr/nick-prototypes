import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { fetchRecipes, type DbRecipe } from "@/shared/api";
import RecipeCard from "@/features/recipe/RecipeCard";
import InlineAIPrompt from "@/features/assistant/AIChatDrawer";

const cuisines = ["All", "Japanese", "Italian", "Middle Eastern", "Thai", "Chinese", "American", "Vietnamese"];
const diets = ["All", "Vegan", "Vegetarian", "Gluten-free"];
const cookTimes = ["All", "Under 20 min", "20–40 min", "Over 40 min"];

export default function Index() {
  const [recipes, setRecipes] = useState<DbRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [diet, setDiet] = useState("All");
  const [cookTime, setCookTime] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = cuisine !== "All" || diet !== "All" || cookTime !== "All";

  useEffect(() => {
    fetchRecipes().then(setRecipes).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(q)) ||
        (r.cuisine || "").toLowerCase().includes(q);

      const matchesCuisine = cuisine === "All" || r.cuisine === cuisine;
      const matchesDiet = diet === "All" || (r.diet_tags || []).includes(diet);

      let matchesCookTime = true;
      if (cookTime === "Under 20 min") matchesCookTime = parseInt(r.cook_time || "0") < 20;
      else if (cookTime === "20–40 min") {
        const t = parseInt(r.cook_time || "0");
        matchesCookTime = t >= 20 && t <= 40;
      } else if (cookTime === "Over 40 min") matchesCookTime = parseInt(r.cook_time || "0") > 40;

      return matchesQuery && matchesCuisine && matchesDiet && matchesCookTime;
    });
  }, [recipes, query, cuisine, diet, cookTime]);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Discover</h1>

      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ingredient, dish, or cuisine…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border bg-background pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`inline-flex items-center gap-1.5 text-sm border rounded-full px-3 py-1.5 transition-colors active:scale-[0.97] ${
            hasActiveFilters || showFilters
              ? "bg-foreground text-background border-foreground"
              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && <span className="text-[10px]">•</span>}
        </button>
        <InlineAIPrompt context="general" />
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-8 animate-in fade-in slide-in-from-top-2 duration-150">
          <FilterGroup label="Cuisine" options={cuisines} value={cuisine} onChange={setCuisine} />
          <FilterGroup label="Diet" options={diets} value={diet} onChange={setDiet} />
          <FilterGroup label="Time" options={cookTimes} value={cookTime} onChange={setCookTime} />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-8">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/3] rounded-lg bg-muted animate-pulse" />
              <div className="mt-3 h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="mt-1.5 h-3 bg-muted rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-8">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-16 text-sm">No recipes match your filters.</p>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mr-1">{label}</span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors active:scale-[0.97] ${
            value === opt
              ? "bg-foreground text-background border-foreground"
              : "bg-background text-foreground border-border hover:bg-secondary"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
