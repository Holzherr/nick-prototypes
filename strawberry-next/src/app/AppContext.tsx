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

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
  recipe_id?: string | null;
  recipe_label?: string | null;
}

interface Collection {
  id: string;
  name: string;
  recipeIds: string[];
  isPublic: boolean;
}

interface AppState {
  savedRecipeIds: string[];
  shoppingList: ShoppingItem[];
  collections: Collection[];
  loading: boolean;
  householdId: string | null;
  sessionId: string;
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

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("default");

  // Resolve household ID when user changes
  useEffect(() => {
    if (!user) {
      setHouseholdId(null);
      setSessionId("default");
      return;
    }
    (async () => {
      try {
        const { data } = await supabase.rpc("get_user_household_id", {
          _user_id: user.id,
        });
        if (data) {
          setHouseholdId(data);
          setSessionId(data);
        } else {
          setSessionId("default");
        }
      } catch {
        setSessionId("default");
      }
    })();
  }, [user]);

  const refreshAll = useCallback(async () => {
    const sid = sessionId;
    try {
      const [saved, items, cols] = await Promise.all([
        fetchSavedRecipeIds(sid),
        fetchShoppingList(sid),
        fetchCollections(sid),
      ]);
      setSavedRecipeIds(saved);
      setShoppingList(items as ShoppingItem[]);
      setCollections(cols);
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Realtime subscriptions for shared data
  useEffect(() => {
    if (!householdId) return;

    const channel = supabase
      .channel(`household-${householdId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "shopping_list_items", filter: `session_id=eq.${householdId}` }, () => {
        fetchShoppingList(householdId).then((items) => setShoppingList(items as ShoppingItem[])).catch(console.error);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "saved_recipes", filter: `session_id=eq.${householdId}` }, () => {
        fetchSavedRecipeIds(householdId).then(setSavedRecipeIds).catch(console.error);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "collections", filter: `session_id=eq.${householdId}` }, () => {
        fetchCollections(householdId).then(setCollections).catch(console.error);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId]);

  const toggleSaveRecipe = useCallback(async (id: string) => {
    const isSaved = savedRecipeIds.includes(id);
    setSavedRecipeIds((prev) => isSaved ? prev.filter((r) => r !== id) : [...prev, id]);
    try {
      if (isSaved) await unsaveRecipe(id, sessionId);
      else await saveRecipe(id, sessionId);
    } catch { refreshAll(); }
  }, [savedRecipeIds, refreshAll, sessionId]);

  const addToShoppingList = useCallback(async (items: { name: string; quantity: string; category: string; recipe_id?: string }[]) => {
    try {
      await addShoppingItems(items, sessionId);
      const updated = await fetchShoppingList(sessionId);
      setShoppingList(updated as ShoppingItem[]);
    } catch (e) { console.error(e); }
  }, [sessionId]);

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
    try {
      await addShoppingItems([{ name, quantity: "", category }], sessionId);
      const updated = await fetchShoppingList(sessionId);
      setShoppingList(updated as ShoppingItem[]);
    } catch (e) { console.error(e); }
  }, [sessionId]);

  const clearCheckedItems = useCallback(async () => {
    setShoppingList((prev) => prev.filter((i) => !i.checked));
    try { await clearCheckedShoppingItems(sessionId); } catch { refreshAll(); }
  }, [refreshAll, sessionId]);

  const clearAllItems = useCallback(async () => {
    setShoppingList([]);
    try { await clearAllShoppingItems(sessionId); } catch { refreshAll(); }
  }, [refreshAll, sessionId]);

  const updateShoppingItem = useCallback(async (id: string, name: string) => {
    setShoppingList((prev) => prev.map((i) => (i.id === id ? { ...i, name } : i)));
    try { await updateShoppingItemName(id, name); } catch { refreshAll(); }
  }, [refreshAll]);

  const createCollection = useCallback(async (name: string) => {
    try {
      await apiCreateCollection(name, sessionId);
      const updated = await fetchCollections(sessionId);
      setCollections(updated);
    } catch (e) { console.error(e); }
  }, [sessionId]);

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
        sessionId,
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
