import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, ChevronDown } from "lucide-react";
import InlineAIPrompt from "@/features/assistant/AIChatDrawer";
import { useApp } from "@/app/AppContext";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { allCategories, detectCategory, getFoodEmoji, isPantryStaple } from "./model";

export default function ShoppingList() {
  const {
    shoppingList,
    toggleShoppingItem,
    removeFromShoppingList,
    addManualShoppingItem,
    clearCheckedItems,
    clearAllItems,
    updateShoppingItem,
    loading: appLoading,
  } = useApp();

  const [newItem, setNewItem] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  type SortMode = "aisle" | "recipe" | "flat";
  const [sortMode, setSortMode] = useState<SortMode>("aisle");
  const groupByCategory = sortMode === "aisle";
  const [showCompleted, setShowCompleted] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    const category = detectCategory(newItem.trim());
    addManualShoppingItem(newItem.trim(), category);
    setNewItem("");
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      updateShoppingItem(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  };

  const uncheckedItems = shoppingList.filter((i) => !i.checked);
  const checkedItems = shoppingList.filter((i) => i.checked);

  // Pantry staples — things you probably already have

  const regularUnchecked = uncheckedItems.filter((i) => !isPantryStaple(i.name));
  const stapleUnchecked = uncheckedItems.filter((i) => isPantryStaple(i.name));
  const [showStaples, setShowStaples] = useState(true);

  // Preview detected category while typing
  const previewCategory = newItem.trim() ? detectCategory(newItem.trim()) : null;

  const renderItem = (item: typeof shoppingList[0]) => (
    <li
      key={item.id}
      className="flex items-center gap-3 py-2 border-b border-dashed last:border-0 group"
    >
      <Checkbox
        checked={item.checked}
        onCheckedChange={() => toggleShoppingItem(item.id)}
      />
      {editingId === item.id ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            ref={editRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") { setEditingId(null); setEditValue(""); }
            }}
            className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button onClick={saveEdit} className="p-1" aria-label="Save">
            <Check className="h-3.5 w-3.5 text-primary" />
          </button>
        </div>
      ) : (
        <span
          className={`flex-1 text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}
          onDoubleClick={() => startEdit(item.id, item.name)}
        >
          {getFoodEmoji(item.name) && (
            <span className="mr-1.5">{getFoodEmoji(item.name)}</span>
          )}
          {item.name}
          {item.quantity && (
            <span className="text-muted-foreground ml-1.5 text-xs">({item.quantity})</span>
          )}
          {!groupByCategory && item.category && (
            <span className="text-muted-foreground ml-2 text-[10px] uppercase tracking-wider">{item.category}</span>
          )}
          {item.recipe_label && (
            <span className="text-muted-foreground ml-2 text-[10px] italic">{item.recipe_label}</span>
          )}
        </span>
      )}
      {editingId !== item.id && (
        <>
          <button
            onClick={() => startEdit(item.id, item.name)}
            className="opacity-0 group-hover:opacity-100 p-1 transition-opacity"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => removeFromShoppingList(item.id)}
            className="opacity-0 group-hover:opacity-100 p-1 transition-opacity"
            aria-label="Remove"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </>
      )}
    </li>
  );

  return (
    <div className="max-w-xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Shopping List</h1>
        <div className="flex items-center gap-2">
          {shoppingList.length > 0 && (
            <div className="flex border rounded-lg overflow-hidden">
              {(["aisle", "recipe", "flat"] as SortMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    sortMode === mode
                      ? "bg-foreground text-background"
                      : "hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  {mode === "aisle" ? "Aisle" : mode === "recipe" ? "Recipe" : "None"}
                </button>
              ))}
            </div>
          )}
          {shoppingList.length > 0 && (
            <button
              onClick={clearAllItems}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md border"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Add item */}
      <div className="flex items-center gap-2 mb-1">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add an item…"
          className="border rounded-full px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-ring"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="p-2 rounded-full border hover:bg-secondary transition-colors active:scale-95"
          aria-label="Add"
        >
          <Plus className="h-4 w-4" />
        </button>
        <InlineAIPrompt context="shopping_list" />
      </div>
      {previewCategory && (
        <p className="text-[11px] text-muted-foreground ml-3 mb-4">
          → {previewCategory}
        </p>
      )}
      {!previewCategory && <div className="mb-4" />}




      {/* List */}
      {appLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="h-4 w-4 rounded bg-muted animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse flex-1" />
              <div className="h-3 w-12 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : regularUnchecked.length > 0 || stapleUnchecked.length > 0 ? (
        <>
          {(() => {
            const withRecipe = regularUnchecked.filter((i) => i.recipe_label);
            const withoutRecipe = regularUnchecked.filter((i) => !i.recipe_label);

            const recipeGroups = Array.from(new Set(withRecipe.map((i) => i.recipe_label!))).map((label) => ({
              label,
              items: withRecipe.filter((i) => i.recipe_label === label),
            }));

            if (sortMode === "recipe") {
              // Recipe-first view: group everything by recipe, then "Other items"
              return (
                <div className="space-y-6">
                  {recipeGroups.map((group) => (
                    <div key={group.label}>
                      <h2 className="text-xs font-medium mb-2 flex items-center gap-1.5">
                        <span className="text-primary">🍽</span>
                        {group.label}
                        <span className="text-[10px] text-muted-foreground font-normal">({group.items.length})</span>
                      </h2>
                      <ul className="space-y-1 pl-1 border-l-2 border-primary/20">
                        {group.items.map(renderItem)}
                      </ul>
                    </div>
                  ))}
                  {withoutRecipe.length > 0 && (
                    <div>
                      <h2 className="text-xs font-medium mb-2 text-muted-foreground">Other items</h2>
                      <ul className="space-y-1">{withoutRecipe.map(renderItem)}</ul>
                    </div>
                  )}
                </div>
              );
            }

            if (sortMode === "aisle") {
              // Aisle/category view
              const categoryGroups = allCategories
                .map((cat) => ({ category: cat, items: regularUnchecked.filter((i) => i.category === cat) }))
                .filter((g) => g.items.length > 0);
              return (
                <div className="space-y-6">
                  {categoryGroups.map((group) => (
                    <div key={group.category}>
                      <h2 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                        {group.category}
                      </h2>
                      <ul className="space-y-1">{group.items.map(renderItem)}</ul>
                    </div>
                  ))}
                </div>
              );
            }

            // Flat view
            return (
              <ul className="space-y-1">{regularUnchecked.map(renderItem)}</ul>
            );
          })()}

          {/* Pantry staples section */}
          {stapleUnchecked.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <button
                onClick={() => setShowStaples((v) => !v)}
                className="flex items-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${showStaples ? "" : "-rotate-90"}`} />
                <span className="font-medium">I'm guessing you already have… ({stapleUnchecked.length})</span>
              </button>
              {showStaples && (
                <ul className="space-y-1 opacity-70">
                  {stapleUnchecked.map(renderItem)}
                </ul>
              )}
            </div>
          )}
        </>
      ) : checkedItems.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 text-sm">
          Your shopping list is empty. Add items from a recipe or manually above.
        </p>
      ) : null}

      {/* Completed section */}
      {checkedItems.length > 0 && (
        <div className="mt-8 border-t pt-4">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="flex items-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showCompleted ? "" : "-rotate-90"}`} />
            <span className="font-medium">Completed ({checkedItems.length})</span>
            <button
              onClick={(e) => { e.stopPropagation(); clearCheckedItems(); }}
              className="ml-auto text-[11px] underline hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </button>
          {showCompleted && (
            <ul className="space-y-1 opacity-60">
              {checkedItems.map(renderItem)}
            </ul>
          )}
        </div>
      )}

      
    </div>
  );
}
