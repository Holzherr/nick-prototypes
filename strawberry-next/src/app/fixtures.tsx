import { AppContext, type AppState, type Collection, type ShoppingItem } from './AppContext';

const noop = () => {};

/** Everything invented — nick-prototypes is public, so no real account or list appears here. */
export const emptyAppState: AppState = {
  savedRecipeIds: [],
  shoppingList: [],
  collections: [],
  loading: false,
  householdId: null,
  toggleSaveRecipe: noop,
  addToShoppingList: noop,
  removeFromShoppingList: noop,
  toggleShoppingItem: noop,
  addManualShoppingItem: noop,
  clearCheckedItems: noop,
  clearAllItems: noop,
  updateShoppingItem: noop,
  createCollection: noop,
  deleteCollection: noop,
  renameCollection: noop,
  toggleCollectionVisibility: noop,
  addToCollection: noop,
  removeFromCollection: noop,
  refreshAll: noop,
};

export const shoppingList: ShoppingItem[] = [
  { id: 's1', name: 'Plum tomatoes', quantity: '400 g', category: 'Produce', checked: false },
  { id: 's2', name: 'Spinach', quantity: '200 g', category: 'Produce', checked: false },
  { id: 's3', name: 'Feta', quantity: '60 g', category: 'Dairy', checked: false },
  { id: 's4', name: 'Sourdough', quantity: '1 loaf', category: 'Bakery', checked: true },
  { id: 's5', name: 'Olive oil', quantity: '', category: 'Pantry', checked: false },
];

export const collections: Collection[] = [
  { id: 'c1', name: 'Weeknight dinners', recipeIds: ['r1', 'r2'], isPublic: true },
  { id: 'c2', name: 'Desserts', recipeIds: ['r3'], isPublic: false },
];

export const populatedAppState: AppState = {
  ...emptyAppState,
  savedRecipeIds: ['r1'],
  shoppingList,
  collections,
  householdId: 'h_story',
};

/** Storybook decorator: hands a component a fixed app state instead of live Supabase data. */
export const withApp =
  (state: AppState = populatedAppState) =>
  (Story: React.ComponentType) => (
    <AppContext.Provider value={state}>
      <Story />
    </AppContext.Provider>
  );
