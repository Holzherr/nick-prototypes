-- Household access: the four holes from the 27 Sep code review, closed together.
--
-- 1. Writes to any profile. The 0001 insert, update and delete policies on watch_entries
--    check only auth.uid() = user_id, and Postgres ORs them with 0013's "Users can manage
--    entries for profiles they control", so any signed-in account could write a row into
--    any profile_id. The 0013 policy covers every write the app makes; these go.
DROP POLICY IF EXISTS "Users can insert own entries" ON public.watch_entries;
DROP POLICY IF EXISTS "Users can update own entries" ON public.watch_entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON public.watch_entries;

-- 2. A managed child's list. The public-profile read policies (0004 for anon, 0007 for
--    authenticated) joined profiles.user_id = watch_entries.user_id, the owning account, so
--    a child's entries, notes and reviews were readable whenever the parent's profile was
--    public. Key both on the entry's own profile instead.
DROP POLICY IF EXISTS "Anon can view entries of public profiles" ON public.watch_entries;
CREATE POLICY "Anon can view entries of public profiles" ON public.watch_entries FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = watch_entries.profile_id AND p.is_public = true));

DROP POLICY IF EXISTS "Auth can view entries of public profiles" ON public.watch_entries;
CREATE POLICY "Auth can view entries of public profiles" ON public.watch_entries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = watch_entries.profile_id AND p.is_public = true));

-- 3. Claiming. profiles.user_id is UNIQUE and the signup trigger gives every account a
--    profile, so 0014's claim (set user_id on the provisioned row) always hit a duplicate
--    key. A caller with a profile now merges the provisioned list into it: entries move,
--    titles already there keep the caller's row, agent rows follow, the provisioned row goes.
CREATE OR REPLACE FUNCTION public.claim_profile(p_claim_code text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  provisioned_id uuid;
  mine uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be signed in to claim a profile';
  END IF;

  SELECT id INTO provisioned_id FROM public.profiles
  WHERE claim_code = p_claim_code AND user_id IS NULL AND owner_user_id IS NULL
  FOR UPDATE;

  IF provisioned_id IS NULL THEN
    RAISE EXCEPTION 'That code is not valid, or the profile has already been claimed';
  END IF;

  SELECT id INTO mine FROM public.profiles WHERE user_id = auth.uid();

  IF mine IS NULL THEN
    UPDATE public.profiles SET user_id = auth.uid(), claim_code = NULL WHERE id = provisioned_id;
    UPDATE public.watch_entries SET user_id = auth.uid() WHERE profile_id = provisioned_id;
    RETURN provisioned_id;
  END IF;

  UPDATE public.watch_entries e SET profile_id = mine, user_id = auth.uid()
  WHERE e.profile_id = provisioned_id
    AND NOT EXISTS (SELECT 1 FROM public.watch_entries m WHERE m.profile_id = mine AND m.title_id = e.title_id);
  UPDATE public.agent_tokens SET profile_id = mine WHERE profile_id = provisioned_id;
  UPDATE public.agent_activity SET profile_id = mine WHERE profile_id = provisioned_id;
  -- Cascades the duplicate entries that stayed behind.
  DELETE FROM public.profiles WHERE id = provisioned_id;
  RETURN mine;
END;
$$;

-- 4. Invite codes. groups is visible only to members and group_members takes an insert only
--    from a member, so an invite code was useless to its recipient. Definer does the lookup
--    and the insert, after checking the caller controls the profile.
CREATE OR REPLACE FUNCTION public.join_group(p_invite_code text, p_profile_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  target uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be signed in to join a group';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = p_profile_id AND (p.user_id = auth.uid() OR p.owner_user_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'That profile is not one you control';
  END IF;

  SELECT id INTO target FROM public.groups WHERE invite_code = p_invite_code;
  IF target IS NULL THEN
    RAISE EXCEPTION 'No group with that code';
  END IF;

  INSERT INTO public.group_members (group_id, profile_id) VALUES (target, p_profile_id)
  ON CONFLICT (group_id, profile_id) DO NOTHING;
  RETURN target;
END;
$$;
