import { supabase } from "@/shared/supabase/client";

export interface DbRecipe {
  id: string;
  title: string;
  description: string | null;
  author_name: string;
  author_handle: string;
  photo_url: string | null;
  servings: number | null;
  cook_time: string | null;
  cuisine: string | null;
  diet_tags: string[] | null;
  ingredients: { name: string; quantity: string; category: string }[];
  steps: string[] | null;
  save_count: number | null;
  is_draft: boolean | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sugar: number | null;
  created_at: string;
  updated_at: string;
}

export async function fetchRecipes() {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("is_draft", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as DbRecipe[];
}

export async function fetchRecipeById(id: string) {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as DbRecipe;
}

export async function fetchSavedRecipeIds(householdId: string) {
  const { data, error } = await supabase
    .from("saved_recipes")
    .select("recipe_id")
    .eq("household_id", householdId);
  if (error) throw error;
  return (data || []).map((r: any) => r.recipe_id as string);
}

export async function saveRecipe(recipeId: string, householdId: string) {
  const { error } = await supabase
    .from("saved_recipes")
    .upsert({ recipe_id: recipeId, household_id: householdId }, { onConflict: "recipe_id,household_id" });
  if (error) throw error;
}

export async function unsaveRecipe(recipeId: string, householdId: string) {
  const { error } = await supabase
    .from("saved_recipes")
    .delete()
    .eq("recipe_id", recipeId)
    .eq("household_id", householdId);
  if (error) throw error;
}

export async function fetchShoppingList(householdId: string) {
  const { data, error } = await supabase
    .from("shopping_list_items")
    .select("*")
    .eq("household_id", householdId)
    .order("category")
    .order("created_at");
  if (error) throw error;
  return data || [];
}

export async function addShoppingItems(
  items: { name: string; quantity: string; category: string; recipe_id?: string }[],
  householdId: string
) {
  const { error } = await supabase
    .from("shopping_list_items")
    .insert(items.map((i) => ({ ...i, household_id: householdId })));
  if (error) throw error;
}

export async function toggleShoppingItemChecked(id: string, checked: boolean) {
  const { error } = await supabase
    .from("shopping_list_items")
    .update({ checked })
    .eq("id", id);
  if (error) throw error;
}

export async function removeShoppingItem(id: string) {
  const { error } = await supabase.from("shopping_list_items").delete().eq("id", id);
  if (error) throw error;
}

export async function updateShoppingItemName(id: string, name: string) {
  const { error } = await supabase
    .from("shopping_list_items")
    .update({ name })
    .eq("id", id);
  if (error) throw error;
}

export async function clearCheckedShoppingItems(householdId: string) {
  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("household_id", householdId)
    .eq("checked", true);
  if (error) throw error;
}

export async function clearAllShoppingItems(householdId: string) {
  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("household_id", householdId);
  if (error) throw error;
}

export async function fetchCollections(householdId: string) {
  const { data, error } = await supabase
    .from("collections")
    .select("*, collection_recipes(recipe_id)")
    .eq("household_id", householdId);
  if (error) throw error;
  return (data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    isPublic: c.is_public,
    recipeIds: (c.collection_recipes || []).map((cr: any) => cr.recipe_id),
  }));
}

export async function createCollection(name: string, householdId: string) {
  const { data, error } = await supabase
    .from("collections")
    .insert({ name, household_id: householdId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCollection(id: string) {
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) throw error;
}

export async function renameCollection(id: string, name: string) {
  const { error } = await supabase.from("collections").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function toggleCollectionPublic(id: string, isPublic: boolean) {
  const { error } = await supabase.from("collections").update({ is_public: isPublic }).eq("id", id);
  if (error) throw error;
}

export async function addRecipeToCollection(collectionId: string, recipeId: string) {
  const { error } = await supabase
    .from("collection_recipes")
    .upsert({ collection_id: collectionId, recipe_id: recipeId }, { onConflict: "collection_id,recipe_id" });
  if (error) throw error;
}

export async function removeRecipeFromCollection(collectionId: string, recipeId: string) {
  const { error } = await supabase
    .from("collection_recipes")
    .delete()
    .eq("collection_id", collectionId)
    .eq("recipe_id", recipeId);
  if (error) throw error;
}

export async function fetchRecipesByAuthor(handle: string) {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("author_handle", handle)
    .eq("is_draft", false);
  if (error) throw error;
  return data as unknown as DbRecipe[];
}
