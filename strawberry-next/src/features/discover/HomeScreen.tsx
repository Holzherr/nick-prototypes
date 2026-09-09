import { Link } from "react-router-dom";
import { BookOpen, ShoppingCart, CalendarDays, ChefHat, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchRecipes, type DbRecipe } from "@/shared/api";
import RecipeCard from "@/features/recipe/RecipeCard";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/shared/components/ui/button";
import BrowseScreen from "./BrowseScreen";

const features = [
  {
    icon: ChefHat,
    title: "Discover & Save",
    description: "Find recipes from the community and save your favourites to your recipe box.",
  },
  {
    icon: CalendarDays,
    title: "Plan Your Meals",
    description: "Drag and drop recipes into a weekly meal plan with calorie and macro tracking.",
  },
  {
    icon: ShoppingCart,
    title: "Smart Shopping List",
    description: "Auto-generate shopping lists from your recipes — organised by category.",
  },
  {
    icon: BookOpen,
    title: "Your Recipe Box",
    description: "Collect, organise, and publish your own recipes for others to discover.",
  },
];

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<DbRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) return;
    fetchRecipes()
      .then((data) => setRecipes(data.filter((r) => r.author_handle !== "anon")))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (!authLoading && user) return <BrowseScreen />;

  return (
    <div>
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Your recipes,<br />all in one place.
        </h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
          Save recipes, plan your meals, track your macros, and generate shopping lists — all from one simple app.
        </p>
        {!user && (
          <div className="flex items-center justify-center gap-3">
            <Link to="/signup">
              <Button size="lg">Get started</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Log in</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="text-center p-4">
              <div className="mx-auto w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community Recipes */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight">From the community</h2>
          <Link to="/recipes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Browse all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="aspect-[4/3] rounded-lg bg-muted animate-pulse" />
                <div className="mt-3 h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="mt-1.5 h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-8">
            {recipes.slice(0, 6).map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12 text-sm">
            No community recipes yet. Be the first to publish one!
          </p>
        )}
      </section>
    </div>
  );
}
