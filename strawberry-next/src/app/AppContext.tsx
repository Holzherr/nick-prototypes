import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  fetchSavedRecipeIds,
  saveRecipe,
  unsaveRecipe,
  fetchShoppingList,
  addShoppingItems,
  toggleShoppingItemChecked,
  removeShoppingItem,
  clearCheckedShoppingItems,
  clearAllShoppingItems,
  updateShoppingItemName,
  fetchCollections,
  createCollection as apiCreateCollection,
  deleteCollection as apiDeleteCollection,
  renameCollection as apiRenameCollection,
  toggleCollectionPublic,
  addRecipeToCollection,
  removeRecipeFromCollection,
} from "@/shared/api";
import { supabase } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/AuthContext";

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
  recipe_id?: string | null;
  recipe_label?: string | null;
}

export interface Collection {
  id: string;
  name: string;
  recipeIds: string[];
  isPublic: boolean;
}

export interface AppState {
  savedRecipeIds: string[];
  shoppingList: ShoppingItem[];
  collections: Collection[];
  loading: boolean;
  householdId: string | null;
  toggleSaveRecipe: (id: string) => void;
  addToShoppingList: (items: { name: string; quantity: string; category: string; recipe_id?: string }[]) => void;
  removeFromShoppingList: (id: string) => void;
  toggleShoppingItem: (id: string) => void;
  addManualShoppingItem: (name: string, category: string) => void;
  clearCheckedItems: () => void;
  clearAllItems: () => void;
  updateShoppingItem: (id: string, name: string) => void;
  createCollection: (name: string) => void;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  toggleCollectionVisibility: (id: string) => void;
  addToCollection: (collectionId: string, recipeId: string) => void;
  removeFromCollection: (collectionId: string, recipeId: string) => void;
  refreshAll: () => void;
}

// Exported so stories can supply a fixed app state without touching Supabase.
export const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  // Resolve household ID when user changes. Signed out there is no household, and therefore no
  // box, list, plan or collections — the old code fell back to a shared "default" bucket that
  // every signed-in user could read and write.
  useEffect(() => {
    if (!user) {
      setHouseholdId(null);
      return;
    }
    (async () => {
      try {
        const { data } = await supabase.rpc("get_user_household_id", { _user_id: user.id });
        setHouseholdId((data as string | null) ?? null);
      } catch (e) {
        console.error("Failed to resolve household:", e);
        setHouseholdId(null);
      }
    })();
  }, [user]);

  const refreshAll = useCallback(async () => {
    if (!householdId) {
      setSavedRecipeIds([]);
      setShoppingList([]);
      setCollections([]);
      setLoading(false);
      return;
    }
    try {
      const [saved, items, cols] = await Promise.all([
        fetchSavedRecipeIds(householdId),
        fetchShoppingList(householdId),
        fetchCollections(householdId),
      ]);
      setSavedRecipeIds(saved);
      setShoppingList(items as ShoppingItem[]);
      setCollections(cols);
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Realtime subscriptions for shared data
  useEffect(() => {
    if (!householdId) return;

    const channel = supabase
      .channel(`household-${householdId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "shopping_list_items", filter: `household_id=eq.${householdId}` }, () => {
        fetchShoppingList(householdId).then((items) => setShoppingList(items as ShoppingItem[])).catch(console.error);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "saved_recipes", filter: `household_id=eq.${householdId}` }, () => {
        fetchSavedRecipeIds(householdId).then(setSavedRecipeIds).catch(console.error);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "collections", filter: `household_id=eq.${householdId}` }, () => {
        fetchCollections(householdId).then(setCollections).catch(console.error);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId]);

  const toggleSaveRecipe = useCallback(async (id: string) => {
    if (!householdId) return;
    const isSaved = savedRecipeIds.includes(id);
    setSavedRecipeIds((prev) => isSaved ? prev.filter((r) => r !== id) : [...prev, id]);
    try {
      if (isSaved) await unsaveRecipe(id, householdId);
      else await saveRecipe(id, householdId);
    } catch { refreshAll(); }
  }, [savedRecipeIds, refreshAll, householdId]);

  const addToShoppingList = useCallback(async (items: { name: string; quantity: string; category: string; recipe_id?: string }[]) => {
    if (!householdId) return;
    try {
      await addShoppingItems(items, householdId);
      const updated = await fetchShoppingList(householdId);
      setShoppingList(updated as ShoppingItem[]);
    } catch (e) { console.error(e); }
  }, [householdId]);

  const removeFromShoppingList = useCallback(async (id: string) => {
    setShoppingList((prev) => prev.filter((i) => i.id !== id));
    try { await removeShoppingItem(id); } catch { refreshAll(); }
  }, [refreshAll]);

  const toggleShoppingItem = useCallback(async (id: string) => {
    const item = shoppingList.find((i) => i.id === id);
    if (!item) return;
    setShoppingList((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
    try { await toggleShoppingItemChecked(id, !item.checked); } catch { refreshAll(); }
  }, [shoppingList, refreshAll]);

  const addManualShoppingItem = useCallback(async (name: string, category: string) => {
    if (!householdId) return;
    try {
      await addShoppingItems([{ name, quantity: "", category }], householdId);
      const updated = await fetchShoppingList(householdId);
      setShoppingList(updated as ShoppingItem[]);
    } catch (e) { console.error(e); }
  }, [householdId]);

  const clearCheckedItems = useCallback(async () => {
    setShoppingList((prev) => prev.filter((i) => !i.checked));
    if (!householdId) return;
    try { await clearCheckedShoppingItems(householdId); } catch { refreshAll(); }
  }, [refreshAll, householdId]);

  const clearAllItems = useCallback(async () => {
    setShoppingList([]);
    if (!householdId) return;
    try { await clearAllShoppingItems(householdId); } catch { refreshAll(); }
  }, [refreshAll, householdId]);

  const updateShoppingItem = useCallback(async (id: string, name: string) => {
    setShoppingList((prev) => prev.map((i) => (i.id === id ? { ...i, name } : i)));
    try { await updateShoppingItemName(id, name); } catch { refreshAll(); }
  }, [refreshAll]);

  const createCollection = useCallback(async (name: string) => {
    if (!householdId) return;
    try {
      await apiCreateCollection(name, householdId);
      const updated = await fetchCollections(householdId);
      setCollections(updated);
    } catch (e) { console.error(e); }
  }, [householdId]);

  const deleteCollection = useCallback(async (id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    try { await apiDeleteCollection(id); } catch { refreshAll(); }
  }, [refreshAll]);

  const renameCollection = useCallback(async (id: string, name: string) => {
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    try { await apiRenameCollection(id, name); } catch { refreshAll(); }
  }, [refreshAll]);

  const toggleCollectionVisibility = useCallback(async (id: string) => {
    const col = collections.find((c) => c.id === id);
    if (!col) return;
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, isPublic: !c.isPublic } : c)));
    try { await toggleCollectionPublic(id, !col.isPublic); } catch { refreshAll(); }
  }, [collections, refreshAll]);

  const addToCollection = useCallback(async (collectionId: string, recipeId: string) => {
    setCollections((prev) => prev.map((c) =>
      c.id === collectionId && !c.recipeIds.includes(recipeId)
        ? { ...c, recipeIds: [...c.recipeIds, recipeId] }
        : c
    ));
    try { await addRecipeToCollection(collectionId, recipeId); } catch { refreshAll(); }
  }, [refreshAll]);

  const removeFromCollection = useCallback(async (collectionId: string, recipeId: string) => {
    setCollections((prev) => prev.map((c) =>
      c.id === collectionId
        ? { ...c, recipeIds: c.recipeIds.filter((r) => r !== recipeId) }
        : c
    ));
    try { await removeRecipeFromCollection(collectionId, recipeId); } catch { refreshAll(); }
  }, [refreshAll]);

  return (
    <AppContext.Provider
      value={{
        savedRecipeIds,
        shoppingList,
        collections,
        loading,
        householdId,
        toggleSaveRecipe,
        addToShoppingList,
        removeFromShoppingList,
        toggleShoppingItem,
        addManualShoppingItem,
        clearCheckedItems,
        clearAllItems,
        updateShoppingItem,
        createCollection,
        deleteCollection,
        renameCollection,
        toggleCollectionVisibility,
        addToCollection,
        removeFromCollection,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
