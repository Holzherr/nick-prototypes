-- Recipes table (stores all published recipes)
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  author_handle TEXT NOT NULL DEFAULT 'anon',
  photo_url TEXT,
  servings INTEGER DEFAULT 2,
  cook_time TEXT,
  cuisine TEXT,
  diet_tags TEXT[] DEFAULT '{}',
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps TEXT[] NOT NULL DEFAULT '{}',
  save_count INTEGER DEFAULT 0,
  is_draft BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published recipes are viewable by everyone"
  ON public.recipes FOR SELECT
  USING (is_draft = false);

CREATE POLICY "Anyone can insert recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update recipes"
  ON public.recipes FOR UPDATE
  USING (true);

-- Saved recipes (bookmarks)
CREATE TABLE public.saved_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(recipe_id, session_id)
);

ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view saved recipes"
  ON public.saved_recipes FOR SELECT USING (true);

CREATE POLICY "Anyone can save recipes"
  ON public.saved_recipes FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can unsave recipes"
  ON public.saved_recipes FOR DELETE USING (true);

-- Shopping list items
CREATE TABLE public.shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity TEXT DEFAULT '',
  category TEXT DEFAULT 'Other',
  checked BOOLEAN DEFAULT false,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shopping list"
  ON public.shopping_list_items FOR SELECT USING (true);

CREATE POLICY "Anyone can add to shopping list"
  ON public.shopping_list_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update shopping list"
  ON public.shopping_list_items FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete from shopping list"
  ON public.shopping_list_items FOR DELETE USING (true);

-- Collections
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  session_id TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view collections"
  ON public.collections FOR SELECT USING (true);

CREATE POLICY "Anyone can create collections"
  ON public.collections FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update collections"
  ON public.collections FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete collections"
  ON public.collections FOR DELETE USING (true);

-- Collection recipes junction
CREATE TABLE public.collection_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  UNIQUE(collection_id, recipe_id)
);

ALTER TABLE public.collection_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view collection recipes"
  ON public.collection_recipes FOR SELECT USING (true);

CREATE POLICY "Anyone can add to collections"
  ON public.collection_recipes FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can remove from collections"
  ON public.collection_recipes FOR DELETE USING (true);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_recipes_cuisine ON public.recipes(cuisine);
CREATE INDEX idx_recipes_is_draft ON public.recipes(is_draft);
CREATE INDEX idx_recipes_author_handle ON public.recipes(author_handle);
CREATE INDEX idx_shopping_list_session ON public.shopping_list_items(session_id);
CREATE INDEX idx_saved_recipes_session ON public.saved_recipes(session_id);
CREATE INDEX idx_collections_session ON public.collections(session_id);