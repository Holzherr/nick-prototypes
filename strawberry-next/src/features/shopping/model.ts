import { allCategories, detectCategory } from './categoryDetect';
import { getFoodEmoji } from './foodEmojis';

export { allCategories, detectCategory, getFoodEmoji };

/**
 * Things almost every kitchen already has. They are split out of the main list so a shop is the
 * things you actually need to buy. Matched on the whole name, not a substring: "garlic" is a
 * staple, "garlic bread" is a shop.
 */
const PANTRY_STAPLES = [
  'salt', 'pepper', 'black pepper', 'oil', 'olive oil', 'vegetable oil', 'cooking oil',
  'butter', 'sugar', 'flour', 'all-purpose flour', 'baking soda', 'baking powder',
  'garlic', 'garlic powder', 'onion powder', 'paprika', 'cumin', 'oregano', 'basil',
  'thyme', 'bay leaf', 'bay leaves', 'cinnamon', 'chili flakes', 'red pepper flakes',
  'soy sauce', 'vinegar', 'white vinegar', 'apple cider vinegar', 'honey',
  'mustard', 'ketchup', 'mayonnaise', 'hot sauce', 'worcestershire sauce',
  'cooking spray', 'cornstarch', 'vanilla', 'vanilla extract', 'eggs',
  'water', 'ice', 'lemon juice',
];

export function isPantryStaple(name: string): boolean {
  const lower = name.toLowerCase().trim();
  return PANTRY_STAPLES.includes(lower);
}

export interface CategorisedItem {
  category: string;
  [key: string]: unknown;
}

export interface CategoryGroup<T> {
  category: string;
  items: T[];
}

/** Buckets a list into `allCategories` order, dropping the categories nothing landed in. */
export function groupByCategory<T extends CategorisedItem>(items: T[]): CategoryGroup<T>[] {
  return allCategories
    .map(category => ({ category, items: items.filter(i => i.category === category) }))
    .filter(group => group.items.length > 0);
}
