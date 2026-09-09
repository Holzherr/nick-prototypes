import { useState, useEffect } from "react";
import { Plus, Lock, Globe, Share2, Trash2, Pencil, Link2, PenLine } from "lucide-react";
import InlineAIPrompt from "@/features/assistant/AIChatDrawer";
import { fetchRecipes, type DbRecipe } from "@/shared/api";
import { useApp } from "@/app/AppContext";
import RecipeCard from "@/features/recipe/RecipeCard";
import ImportRecipeDialog from "@/features/recipe/ImportRecipeDialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function RecipeBox() {
  const {
    savedRecipeIds,
    collections,
    createCollection,
    deleteCollection,
    renameCollection,
    toggleCollectionVisibility,
  } = useApp();

  const [allRecipes, setAllRecipes] = useState<DbRecipe[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | string>("all");
  const [showImport, setShowImport] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipes().then((recipes) => {
      setAllRecipes(recipes);
      // Preload images for saved recipes in background
      recipes.forEach((r) => {
        if (r.photo_url && savedRecipeIds.includes(r.id)) {
          const img = new Image();
          img.src = r.photo_url;
        }
      });
    }).catch(console.error);
  }, []);

  const savedRecipes = allRecipes.filter((r) => savedRecipeIds.includes(r.id));

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCollection(newName.trim());
    setNewName("");
    toast("Collection created");
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) return;
    renameCollection(id, editName.trim());
    setEditingId(null);
    setEditName("");
  };

  const handleShare = (name: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/collection/${name.toLowerCase().replace(/\s+/g, "-")}`);
    toast("Collection link copied");
  };

  const activeCollection = collections.find((c) => c.id === activeTab);
  const displayRecipes =
    activeTab === "all"
      ? savedRecipes
      : allRecipes.filter((r) => activeCollection?.recipeIds.includes(r.id));

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Recipe Box</h1>
        <div className="flex items-center gap-2">
          <InlineAIPrompt context="recipe_box" />
          <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="inline-flex items-center gap-1.5 text-sm border rounded-full px-4 py-2 hover:bg-secondary transition-colors active:scale-[0.97] font-medium"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
          {showAddMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
              <div className="absolute right-0 top-full mt-2 bg-background border rounded-xl shadow-lg z-50 w-56 overflow-hidden">
                <button
                  onClick={() => { setShowAddMenu(false); navigate("/publish"); }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors flex items-center gap-3"
                >
                  <PenLine className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Publish your own</div>
                    <div className="text-xs text-muted-foreground">Write a new recipe</div>
                  </div>
                </button>
                <button
                  onClick={() => { setShowAddMenu(false); setShowImport(true); }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors flex items-center gap-3 border-t"
                >
                  <Link2 className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Import from URL</div>
                    <div className="text-xs text-muted-foreground">Paste a recipe link</div>
                  </div>
                </button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b scrollbar-hide">
        <button
          onClick={() => setActiveTab("all")}
          className={`shrink-0 text-sm px-3 py-1.5 rounded-full border transition-colors ${
            activeTab === "all" ? "bg-foreground text-background border-foreground" : "hover:bg-secondary"
          }`}
        >
          All saved ({savedRecipes.length})
        </button>
        {collections.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveTab(c.id)}
            className={`shrink-0 text-sm px-3 py-1.5 rounded-full border transition-colors inline-flex items-center gap-1.5 ${
              activeTab === c.id ? "bg-foreground text-background border-foreground" : "hover:bg-secondary"
            }`}
          >
            {c.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {c.name} ({c.recipeIds.length})
          </button>
        ))}
      </div>

      {activeTab !== "all" && activeCollection && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {editingId === activeCollection.id ? (
            <form onSubmit={(e) => { e.preventDefault(); handleRename(activeCollection.id); }} className="flex items-center gap-2">
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="border rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" autoFocus />
              <button type="submit" className="text-xs underline">Save</button>
              <button type="button" onClick={() => setEditingId(null)} className="text-xs text-muted-foreground">Cancel</button>
            </form>
          ) : (
            <>
              <button onClick={() => { setEditingId(activeCollection.id); setEditName(activeCollection.name); }} className="p-1.5 rounded-full hover:bg-secondary transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => toggleCollectionVisibility(activeCollection.id)} className="p-1.5 rounded-full hover:bg-secondary transition-colors">{activeCollection.isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}</button>
              <button onClick={() => handleShare(activeCollection.name)} className="p-1.5 rounded-full hover:bg-secondary transition-colors"><Share2 className="h-3.5 w-3.5" /></button>
              <button onClick={() => { deleteCollection(activeCollection.id); setActiveTab("all"); }} className="p-1.5 rounded-full hover:bg-secondary transition-colors text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mb-8">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New collection name…"
          className="border rounded-full px-3 py-1.5 text-sm flex-1 max-w-xs focus:outline-none focus:ring-1 focus:ring-ring"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button onClick={handleCreate} className="inline-flex items-center gap-1 text-xs border rounded-full px-3 py-1.5 hover:bg-secondary transition-colors active:scale-[0.97]">
          <Plus className="h-3.5 w-3.5" /> Create
        </button>
      </div>

      {allRecipes.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-8">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/3] rounded-lg bg-muted animate-pulse" />
              <div className="mt-3 h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="mt-1.5 h-3 bg-muted rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      ) : displayRecipes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-8">
          {displayRecipes.map((r, i) => (<RecipeCard key={r.id} recipe={r} priority={i < 6} />))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-16 text-sm">
          {activeTab === "all" ? "No saved recipes yet. Discover and save your favourites." : "This collection is empty."}
        </p>
      )}

      <ImportRecipeDialog open={showImport} onClose={() => setShowImport(false)} />
      
    </div>
  );
}
