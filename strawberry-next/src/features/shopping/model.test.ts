import { describe, expect, it } from 'vitest';
import {
  allCategories,
  detectCategory,
  getFoodEmoji,
  groupByCategory,
  isPantryStaple,
} from './model';

describe('category detection', () => {
  it('sorts the everyday shop correctly', () => {
    const samples: Record<string, string> = {
      Produce: 'spinach',
      Dairy: 'cottage cheese',
      Meat: 'chicken thighs',
      Seafood: 'salmon fillet',
      Bakery: 'sourdough',
      Pantry: 'plain flour',
    };
    for (const [category, item] of Object.entries(samples)) {
      expect(detectCategory(item), item).toBe(category);
    }
    expect(allCategories).toEqual(expect.arrayContaining(Object.keys(samples)));
  });

  it('ignores case and surrounding space', () => {
    expect(detectCategory('  SPINACH ')).toBe(detectCategory('spinach'));
  });

  it('falls back to Other', () => {
    expect(detectCategory('xylophone')).toBe('Other');
    expect(allCategories.at(-1)).toBe('Other');
  });

  // KNOWN DEFECT, ported as-is from the Lovable app rather than fixed here.
  // detectCategory takes the first category whose keyword list contains a *substring* of the item,
  // so a keyword buried inside an unrelated word wins, and an earlier category beats a better later
  // one. These assertions are wrong-but-current: change them when the matcher is fixed to match on
  // word boundaries and to prefer the longest keyword, and the grouping in the shopping list
  // becomes right.
  it('misfiles anything whose name merely contains a keyword', () => {
    expect(detectCategory('tahini')).toBe('Seafood'); // "ahi"
    expect(detectCategory('bicarbonate of soda')).toBe('Beverages'); // "soda"
    expect(detectCategory('szechuan peppercorn dust')).toBe('Produce'); // "pepper"
  });

  it('lets an earlier category win over a more specific later one', () => {
    expect(detectCategory('frozen peas')).toBe('Produce'); // not Frozen
    expect(detectCategory('orange juice')).toBe('Produce'); // not Beverages
    expect(detectCategory('soy sauce')).toBe('Pantry'); // not Condiments & Sauces
  });
});

describe('food emoji', () => {
  it('matches exactly and by substring', () => {
    expect(getFoodEmoji('tomatoes')).toBe('🍅');
    expect(getFoodEmoji('2 ripe avocados')).toBe('🥑');
  });

  it('returns null rather than a placeholder when nothing matches', () => {
    expect(getFoodEmoji('gochujang')).toBeNull();
  });
});

describe('pantry staples', () => {
  it('matches the whole name only, so "garlic bread" is shopping and "garlic" is a staple', () => {
    expect(isPantryStaple('garlic')).toBe(true);
    expect(isPantryStaple('Olive Oil')).toBe(true);
    expect(isPantryStaple('garlic bread')).toBe(false);
    expect(isPantryStaple('chicken')).toBe(false);
  });
});

describe('groupByCategory', () => {
  const items = [
    { id: '1', name: 'spinach', category: 'Produce' },
    { id: '2', name: 'milk', category: 'Dairy' },
    { id: '3', name: 'kale', category: 'Produce' },
  ];

  it('groups in the order categories are declared, not insertion order', () => {
    expect(groupByCategory(items).map(g => g.category)).toEqual(['Produce', 'Dairy']);
  });

  it('drops empty categories', () => {
    expect(groupByCategory(items).find(g => g.category === 'Frozen')).toBeUndefined();
  });

  it('keeps every item exactly once', () => {
    expect(groupByCategory(items).flatMap(g => g.items)).toHaveLength(items.length);
  });
});
