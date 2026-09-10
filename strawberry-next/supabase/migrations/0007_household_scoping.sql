-- Household scoping.
--
-- Migration 0005 already replaced the original `USING (true)` policies on shopping_list_items,
-- saved_recipes, collections and meal_plan_items with `can_access_session(auth.uid(), session_id)`.
-- Three holes were left behind, and this migration closes them:
--
--   1. `can_access_session` returns TRUE unconditionally when session_id = 'default' — which is the
--      column default, and what the client writes whenever nobody is signed in or the household
--      lookup fails. Every 'default' row is therefore shared with every signed-in user.
--   2. `collection_recipes` was never revisited: still `USING (true)` / `WITH CHECK (true)` with no
--      role restriction, so the contents of every collection are readable and writable with the
--      public anon key alone.
--   3. `recipes` allows "Anyone can insert" and "Anyone can update ... USING (true)", so anyone
--      holding the anon key can rewrite or delete another author's published recipe.
--
-- The fix for (1) is structural rather than a patch to the function: session_id TEXT becomes
-- household_id UUID, so 'default' can no longer be represented at all.

-- ---------------------------------------------------------------------------
-- 1. session_id TEXT -> household_id UUID
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.user_households()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
$$;

-- Policies on those four tables reference session_id, so they have to go before the column does.
DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOREACH t IN ARRAY ARRAY['saved_recipes', 'shopping_list_items', 'collections', 'meal_plan_items']
  LOOP
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;
  END LOOP;
END;
$$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['saved_recipes', 'shopping_list_items', 'collections', 'meal_plan_items']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN household_id uuid REFERENCES public.households(id) ON DELETE CASCADE', t);
    -- Only rows already carrying a real household uuid survive; 'default' rows were shared with
    -- everyone and cannot be attributed to an owner, so they go.
    EXECUTE format($f$UPDATE public.%I SET household_id = session_id::uuid
                      WHERE session_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
                        AND session_id::uuid IN (SELECT id FROM public.households)$f$, t);
    EXECUTE format('DELETE FROM public.%I WHERE household_id IS NULL', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN household_id SET NOT NULL', t);
    EXECUTE format('ALTER TABLE public.%I DROP COLUMN session_id', t);
    EXECUTE format('CREATE INDEX %I ON public.%I (household_id)', t || '_household_id_idx', t);
  END LOOP;
END;
$$;

-- saved_recipes' uniqueness was (recipe_id, session_id).
ALTER TABLE public.saved_recipes DROP CONSTRAINT IF EXISTS saved_recipes_recipe_id_session_id_key;
ALTER TABLE public.saved_recipes ADD CONSTRAINT saved_recipes_recipe_id_household_id_key UNIQUE (recipe_id, household_id);

DROP FUNCTION IF EXISTS public.can_access_session(uuid, text);

-- ---------------------------------------------------------------------------
-- 2. Re-point the four tables' policies at household_id
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['saved_recipes', 'shopping_list_items', 'collections', 'meal_plan_items']
  LOOP
    EXECUTE format($f$CREATE POLICY "Household members read" ON public.%I FOR SELECT TO authenticated
                      USING (household_id IN (SELECT public.user_households()))$f$, t);
    EXECUTE format($f$CREATE POLICY "Household members insert" ON public.%I FOR INSERT TO authenticated
                      WITH CHECK (household_id IN (SELECT public.user_households()))$f$, t);
    EXECUTE format($f$CREATE POLICY "Household members update" ON public.%I FOR UPDATE TO authenticated
                      USING (household_id IN (SELECT public.user_households()))
                      WITH CHECK (household_id IN (SELECT public.user_households()))$f$, t);
    EXECUTE format($f$CREATE POLICY "Household members delete" ON public.%I FOR DELETE TO authenticated
                      USING (household_id IN (SELECT public.user_households()))$f$, t);
  END LOOP;
END;
$$;

-- A public collection stays publicly readable — that is the shareable-box feature.
CREATE POLICY "Public collections are readable"
  ON public.collections FOR SELECT
  USING (is_public = true);

-- ---------------------------------------------------------------------------
-- 3. collection_recipes inherits its scope from the collection it belongs to
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view collection recipes" ON public.collection_recipes;
DROP POLICY IF EXISTS "Anyone can add to collections" ON public.collection_recipes;
DROP POLICY IF EXISTS "Anyone can remove from collections" ON public.collection_recipes;

CREATE POLICY "Members read collection contents"
  ON public.collection_recipes FOR SELECT TO authenticated
  USING (collection_id IN (
    SELECT id FROM public.collections WHERE household_id IN (SELECT public.user_households())
  ));

CREATE POLICY "Public collection contents are readable"
  ON public.collection_recipes FOR SELECT
  USING (collection_id IN (SELECT id FROM public.collections WHERE is_public = true));

CREATE POLICY "Members add to collections"
  ON public.collection_recipes FOR INSERT TO authenticated
  WITH CHECK (collection_id IN (
    SELECT id FROM public.collections WHERE household_id IN (SELECT public.user_households())
  ));

CREATE POLICY "Members remove from collections"
  ON public.collection_recipes FOR DELETE TO authenticated
  USING (collection_id IN (
    SELECT id FROM public.collections WHERE household_id IN (SELECT public.user_households())
  ));

-- ---------------------------------------------------------------------------
-- 4. Recipes belong to their author
-- ---------------------------------------------------------------------------

ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

UPDATE public.recipes r
SET author_id = p.id
FROM public.profiles p
WHERE r.author_id IS NULL AND p.handle IS NOT NULL AND r.author_handle = p.handle;

DROP POLICY IF EXISTS "Published recipes are viewable by everyone" ON public.recipes;
DROP POLICY IF EXISTS "Anyone can insert recipes" ON public.recipes;
DROP POLICY IF EXISTS "Anyone can update recipes" ON public.recipes;
DROP POLICY IF EXISTS "Anyone can delete recipes" ON public.recipes;

CREATE POLICY "Published recipes are viewable by everyone"
  ON public.recipes FOR SELECT
  USING (is_draft = false);

CREATE POLICY "Authors see their own drafts"
  ON public.recipes FOR SELECT TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Authors insert their own recipes"
  ON public.recipes FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors update their own recipes"
  ON public.recipes FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors delete their own recipes"
  ON public.recipes FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- save_count is maintained by the app, which can no longer UPDATE another author's row.
CREATE OR REPLACE FUNCTION public.bump_save_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.recipes SET save_count = COALESCE(save_count, 0) + 1 WHERE id = NEW.recipe_id;
    RETURN NEW;
  ELSE
    UPDATE public.recipes SET save_count = GREATEST(COALESCE(save_count, 1) - 1, 0) WHERE id = OLD.recipe_id;
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS saved_recipes_bump_save_count ON public.saved_recipes;
CREATE TRIGGER saved_recipes_bump_save_count
  AFTER INSERT OR DELETE ON public.saved_recipes
  FOR EACH ROW EXECUTE FUNCTION public.bump_save_count();
