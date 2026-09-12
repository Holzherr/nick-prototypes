-- The agent surface: tokens an assistant can act with, and profiles it can start filling
-- before its user has ever opened Qeued.

-- A profile may now also be unattached: created by an agent, waiting for a person to claim
-- it. Claiming sets user_id and the profile becomes an ordinary one.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profile_has_an_owner;
ALTER TABLE public.profiles ADD CONSTRAINT profile_has_an_owner
  CHECK (num_nonnulls(user_id, owner_user_id) <= 1);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS claim_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS provisioned_by TEXT,
  ADD COLUMN IF NOT EXISTS provisioned_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.profiles.claim_code IS 'Set while an agent-created profile is waiting to be claimed by a person; cleared on claim.';
COMMENT ON COLUMN public.profiles.provisioned_by IS 'Name the agent gave for itself when it created this profile.';

-- Tokens are stored hashed: a leaked database row must not be usable as a credential.
CREATE TABLE IF NOT EXISTS public.agent_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  label TEXT,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read', 'write'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_agent_tokens_profile ON public.agent_tokens(profile_id);

ALTER TABLE public.agent_tokens ENABLE ROW LEVEL SECURITY;

-- Tokens are readable only as metadata, by the account that controls the profile.
CREATE POLICY "Users can view tokens for profiles they control" ON public.agent_tokens FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND (p.user_id = auth.uid() OR p.owner_user_id = auth.uid())));
CREATE POLICY "Users can revoke tokens for profiles they control" ON public.agent_tokens FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND (p.user_id = auth.uid() OR p.owner_user_id = auth.uid())));

-- What agents did, so a person can see what was written on their behalf and rate-limiting
-- has something to count.
CREATE TABLE IF NOT EXISTS public.agent_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agent_activity_profile ON public.agent_activity(profile_id, created_at DESC);

ALTER TABLE public.agent_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view activity on profiles they control" ON public.agent_activity FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND (p.user_id = auth.uid() OR p.owner_user_id = auth.uid())));

-- Claiming an agent-provisioned profile: the one write a signed-in person makes to a
-- profile that is not yet theirs. SECURITY DEFINER so it can flip an unowned row exactly once.
CREATE OR REPLACE FUNCTION public.claim_profile(p_claim_code text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  claimed_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be signed in to claim a profile';
  END IF;

  UPDATE public.profiles
  SET user_id = auth.uid(), claim_code = NULL
  WHERE claim_code = p_claim_code
    AND user_id IS NULL
    AND owner_user_id IS NULL
  RETURNING id INTO claimed_id;

  IF claimed_id IS NULL THEN
    RAISE EXCEPTION 'That code is not valid, or the profile has already been claimed';
  END IF;

  UPDATE public.watch_entries SET user_id = auth.uid() WHERE profile_id = claimed_id;
  RETURN claimed_id;
END;
$$;

-- An agent writes entries before anyone has signed in, so the owning account is unknown
-- until the profile is claimed.
ALTER TABLE public.watch_entries ALTER COLUMN user_id DROP NOT NULL;
