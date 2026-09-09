export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealType = (typeof MEAL_TYPES)[number];
export type ViewMode = 'day' | 'week';

export interface MealPlanItem {
  id: string;
  session_id: string;
  recipe_id: string | null;
  title: string;
  date: string;
  meal_type: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export interface DayTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Callbacks a cell needs, threaded down from the screen so the grid bricks stay data-free. */
export interface MealCellHandlers {
  onAdd: (date: string, mealType: MealType) => void;
  onDelete: (id: string) => void;
  onDragStart: (item: MealPlanItem) => void;
  onDrop: (date: string, mealType: MealType) => void;
}
