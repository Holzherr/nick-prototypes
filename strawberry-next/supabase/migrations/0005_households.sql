
-- Create households table
CREATE TABLE public.households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My Household',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

-- Create household_members table
CREATE TABLE public.household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(household_id, user_id)
);
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- Create household_invites table
CREATE TABLE public.household_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  invite_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  invited_email text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.household_invites ENABLE ROW LEVEL SECURITY;

-- Security definer function to check household membership
CREATE OR REPLACE FUNCTION public.is_household_member(_user_id uuid, _household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE user_id = _user_id AND household_id = _household_id
  )
$$;

-- Get user's household id
CREATE OR REPLACE FUNCTION public.get_user_household_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT household_id FROM public.household_members
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Safe session access check (handles text session_id)
CREATE OR REPLACE FUNCTION public.can_access_session(_user_id uuid, _session_id text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _session_id = 'default' THEN
    RETURN true;
  END IF;
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM public.household_members
      WHERE user_id = _user_id AND household_id = _session_id::uuid
    );
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN false;
  END;
END;
$$;

-- Accept invite function
CREATE OR REPLACE FUNCTION public.accept_household_invite(_invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
  old_household_id uuid;
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO invite_record
  FROM public.household_invites
  WHERE invite_code = _invite_code
    AND accepted_at IS NULL
    AND expires_at > now();

  IF invite_record IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite';
  END IF;

  SELECT household_id INTO old_household_id
  FROM public.household_members
  WHERE user_id = _user_id;

  IF old_household_id = invite_record.household_id THEN
    RAISE EXCEPTION 'Already a member of this household';
  END IF;

  DELETE FROM public.household_members WHERE user_id = _user_id;

  IF old_household_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.household_members WHERE household_id = old_household_id) THEN
      DELETE FROM public.households WHERE id = old_household_id;
    END IF;
  END IF;

  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (invite_record.household_id, _user_id, 'member');

  UPDATE public.household_invites
  SET accepted_at = now(), accepted_by = _user_id
  WHERE id = invite_record.id;

  RETURN invite_record.household_id;
END;
$$;

-- Auto-create household on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_household()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_household_id uuid;
BEGIN
  INSERT INTO public.households (name, created_by)
  VALUES ('My Household', NEW.id)
  RETURNING id INTO new_household_id;

  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (new_household_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_household
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_household();

-- Create households for existing users
DO $$
DECLARE
  user_record RECORD;
  new_hid uuid;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    IF NOT EXISTS (SELECT 1 FROM public.household_members WHERE user_id = user_record.id) THEN
      INSERT INTO public.households (name, created_by)
      VALUES ('My Household', user_record.id)
      RETURNING id INTO new_hid;

      INSERT INTO public.household_members (household_id, user_id, role)
      VALUES (new_hid, user_record.id, 'owner');
    END IF;
  END LOOP;
END;
$$;

-- RLS for households
CREATE POLICY "Users can view their households"
  ON public.households FOR SELECT TO authenticated
  USING (public.is_household_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create households"
  ON public.households FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners can update their household"
  ON public.households FOR UPDATE TO authenticated
  USING (public.is_household_member(auth.uid(), id));

-- RLS for household_members
CREATE POLICY "Members can view their household members"
  ON public.household_members FOR SELECT TO authenticated
  USING (public.is_household_member(auth.uid(), household_id));

CREATE POLICY "Authenticated users can join households"
  ON public.household_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can leave households"
  ON public.household_members FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- RLS for household_invites
CREATE POLICY "Members can view invites for their household"
  ON public.household_invites FOR SELECT TO authenticated
  USING (public.is_household_member(auth.uid(), household_id));

CREATE POLICY "Public can view invite by code"
  ON public.household_invites FOR SELECT
  USING (true);

CREATE POLICY "Members can create invites"
  ON public.household_invites FOR INSERT TO authenticated
  WITH CHECK (public.is_household_member(auth.uid(), household_id));

CREATE POLICY "Members can delete invites"
  ON public.household_invites FOR DELETE TO authenticated
  USING (public.is_household_member(auth.uid(), household_id));

CREATE POLICY "Accept invites"
  ON public.household_invites FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- Update RLS on shopping_list_items
DROP POLICY IF EXISTS "Anyone can add to shopping list" ON public.shopping_list_items;
DROP POLICY IF EXISTS "Anyone can delete from shopping list" ON public.shopping_list_items;
DROP POLICY IF EXISTS "Anyone can update shopping list" ON public.shopping_list_items;
DROP POLICY IF EXISTS "Anyone can view shopping list" ON public.shopping_list_items;

CREATE POLICY "Household members can view shopping list"
  ON public.shopping_list_items FOR SELECT TO authenticated
  USING (public.can_access_session(auth.uid(), session_id));

CREATE POLICY "Household members can add to shopping list"
  ON public.shopping_list_items FOR INSERT TO authenticated
  WITH CHECK (public.can_access_session(auth.uid(), session_id));

CREATE POLICY "Household members can update shopping list"
  ON public.shopping_list_items FOR UPDATE TO authenticated
  USING (public.can_access_session(auth.uid(), session_id));

CREATE POLICY "Household members can delete from shopping list"
  ON public.shopping_list_items FOR DELETE TO authenticated
  USING (public.can_access_session(auth.uid(), session_id));

-- Update RLS on saved_recipes
DROP POLICY IF EXISTS "Anyone can save recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Anyone can unsave recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Anyone can view saved recipes" ON public.saved_recipes;

CREATE POLICY "Household members can view saved recipes"
  ON public.saved_recipes FOR SELECT TO authenticated
  USING (public.can_access_session(auth.uid(), session_id));

CREATE POLICY "Household members can save recipes"
  ON public.saved_recipes FOR INSERT TO authenticated
  WITH CHECK (public.can_access_session(auth.uid(), session_id));

CREATE POLICY "Household members can unsave recipes"
  ON public.saved_recipes FOR DELETE TO authenticated
  USING (public.can_access_session(auth.uid(), session_id));

-- Update RLS on collections
DROP POLICY IF EXISTS "Anyone can create collections" ON public.collections;
DROP POLICY IF EXISTS "Anyone can delete collections" ON public.collections;
DROP POLICY IF EXISTS "Anyone can update collections" ON public.collections;
DROP POLICY IF EXISTS "Anyone can view collections" ON public.collections;

CREATE POLICY "Household members can view collections"
  ON public.collections FOR SELECT TO authenticated
  USING (public.can_access_session(auth.uid(), session_id));

CREATE POLICY "Household members can create collections"
  ON public.collections FOR INSERT TO authenticated
  WITH CHECK (public.can_access_session(auth.uid(), session_id));

CREATE POLICY "Household members can update collections"
  ON public.collections FOR UPDATE TO authenticated
  USING (public.can_access_session(auth.uid(), session_id));

CREATE POLICY "Household members can delete collections"
  ON public.collections FOR DELETE TO authenticated
  USING (public.can_access_session(auth.uid(), session_id));

-- Update RLS on meal_plan_items
DROP POLICY IF EXISTS "Anyone can delete meal plan items" ON public.meal_plan_items;
DROP POLICY IF EXISTS "Anyone can insert meal plan items" ON public.meal_plan_items;
DROP POLICY IF EXISTS "Anyone can update meal plan items" ON public.meal_plan_items;
DROP POLICY IF EXISTS "Anyone can view meal plan items" ON public.meal_plan_items;

CREATE POLICY "Household members can view meal plan"
  ON public.meal_plan_items FOR SELECT TO authenticated
  USING (public.can_access_session(auth.uid(), session_id));

CREATE POLICY "Household members can add to meal plan"
  ON public.meal_plan_items FOR INSERT TO authenticated
  WITH CHECK (public.can_access_session(auth.uid(), session_id));

CREATE POLICY "Household members can update meal plan"
  ON public.meal_plan_items FOR UPDATE TO authenticated
  USING (public.can_access_session(auth.uid(), session_id));

CREATE POLICY "Household members can delete from meal plan"
  ON public.meal_plan_items FOR DELETE TO authenticated
  USING (public.can_access_session(auth.uid(), session_id));

-- Enable realtime on shared tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_list_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_plan_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.household_members;
