-- Households: several people per account, and groups that share a queue.
--
-- A profile is either linked to a login (user_id) or managed by someone who has one
-- (owner_user_id) — that is how a child gets a list without an email address. Entries keep
-- user_id as the owning account, so existing access rules still hold, and gain profile_id
-- to say whose taste the row represents.

ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS max_certification TEXT,
  ADD COLUMN IF NOT EXISTS colour TEXT;

COMMENT ON COLUMN public.profiles.owner_user_id IS 'Set for managed profiles (a child); null when the profile has its own login.';
COMMENT ON COLUMN public.profiles.max_certification IS 'Highest UK certificate this profile should be offered, e.g. PG, 12. Null means no limit.';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profile_has_an_owner;
ALTER TABLE public.profiles ADD CONSTRAINT profile_has_an_owner
  CHECK (num_nonnulls(user_id, owner_user_id) = 1);

-- Whose taste the row represents, as distinct from which account owns it.
ALTER TABLE public.watch_entries
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

UPDATE public.watch_entries e
SET profile_id = p.id
FROM public.profiles p
WHERE e.profile_id IS NULL AND p.user_id = e.user_id;

ALTER TABLE public.watch_entries ALTER COLUMN profile_id SET NOT NULL;

ALTER TABLE public.watch_entries DROP CONSTRAINT IF EXISTS watch_entries_user_id_title_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_watch_entries_profile_title ON public.watch_entries(profile_id, title_id);
CREATE INDEX IF NOT EXISTS idx_watch_entries_profile ON public.watch_entries(profile_id);

-- Managing other people's profiles.
CREATE POLICY "Users can view profiles they manage" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = owner_user_id);
CREATE POLICY "Users can create managed profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Users can update profiles they manage" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = owner_user_id);
CREATE POLICY "Users can delete profiles they manage" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = owner_user_id);

-- Groups: a household, a film club, the kids. Membership is by profile, so a managed
-- child profile joins the same way an adult with a login does.
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 16),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (group_id, profile_id)
);
CREATE INDEX IF NOT EXISTS idx_group_members_profile ON public.group_members(profile_id);

-- Does this account reach into this group, through any profile it controls?
-- SECURITY DEFINER because the membership policies would otherwise recurse through
-- group_members to answer their own question.
CREATE OR REPLACE FUNCTION public.account_in_group(p_group_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members m
    JOIN public.profiles p ON p.id = m.profile_id
    WHERE m.group_id = p_group_id
      AND (p.user_id = p_user_id OR p.owner_user_id = p_user_id)
  );
$$;

-- Does this account share any group with the given profile? Gates reading a housemate's list.
CREATE OR REPLACE FUNCTION public.account_shares_group_with_profile(p_profile_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members theirs
    JOIN public.group_members mine ON mine.group_id = theirs.group_id
    JOIN public.profiles p ON p.id = mine.profile_id
    WHERE theirs.profile_id = p_profile_id
      AND (p.user_id = p_user_id OR p.owner_user_id = p_user_id)
  );
$$;

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their groups" ON public.groups FOR SELECT TO authenticated
  USING (auth.uid() = owner_user_id OR public.account_in_group(id, auth.uid()));
CREATE POLICY "Users can create groups" ON public.groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Owners can update their groups" ON public.groups FOR UPDATE TO authenticated USING (auth.uid() = owner_user_id);
CREATE POLICY "Owners can delete their groups" ON public.groups FOR DELETE TO authenticated USING (auth.uid() = owner_user_id);

CREATE POLICY "Members can view the roster" ON public.group_members FOR SELECT TO authenticated
  USING (public.account_in_group(group_id, auth.uid()));
CREATE POLICY "Users can add profiles they control" ON public.group_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND (p.user_id = auth.uid() OR p.owner_user_id = auth.uid()))
    AND (public.account_in_group(group_id, auth.uid()) OR EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_user_id = auth.uid()))
  );
CREATE POLICY "Users can remove profiles they control" ON public.group_members FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND (p.user_id = auth.uid() OR p.owner_user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_user_id = auth.uid())
  );

-- Reading each other's lists: what a shared queue is made of.
CREATE POLICY "Group members can view each other's entries" ON public.watch_entries FOR SELECT TO authenticated
  USING (public.account_shares_group_with_profile(profile_id, auth.uid()));

CREATE POLICY "Users can manage entries for profiles they control" ON public.watch_entries FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND (p.user_id = auth.uid() OR p.owner_user_id = auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND (p.user_id = auth.uid() OR p.owner_user_id = auth.uid())));
