import { detectCategory } from '@/features/shopping/model';

export interface IngredientRow {
  name: string;
  quantity: string;
}

/** Index signature so the array satisfies Supabase's `Json` column type without a cast. */
export interface Ingredient extends IngredientRow {
  category: string;
  [key: string]: string;
}

/** Publish form → what goes in the `recipes.ingredients` JSON: trimmed, named, categorised. */
export function cleanIngredients(rows: IngredientRow[]): Ingredient[] {
  return rows
    .filter(row => row.name.trim())
    .map(row => ({
      name: row.name.trim(),
      quantity: row.quantity.trim(),
      category: detectCategory(row.name.trim()),
    }));
}

/** Publish form → `recipes.steps`: trimmed, blanks dropped, order kept. */
export function cleanSteps(steps: string[]): string[] {
  return steps.map(step => step.trim()).filter(Boolean);
}
