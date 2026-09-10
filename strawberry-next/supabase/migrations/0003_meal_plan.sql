
CREATE TABLE public.meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL DEFAULT 'default',
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL DEFAULT 'lunch',
  calories INTEGER DEFAULT 0,
  protein REAL DEFAULT 0,
  carbs REAL DEFAULT 0,
  fat REAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view meal plan items" ON public.meal_plan_items FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert meal plan items" ON public.meal_plan_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update meal plan items" ON public.meal_plan_items FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete meal plan items" ON public.meal_plan_items FOR DELETE TO public USING (true);
