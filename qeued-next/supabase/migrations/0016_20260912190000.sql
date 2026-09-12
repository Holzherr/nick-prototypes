-- OAuth for the agent surface, so connecting Qeued is a button rather than a pasted token.
--
-- MCP clients register themselves (RFC 7591), send the user through an approval screen, and
-- exchange a one-time code for a token. The tokens are the same agent_tokens rows a manual
-- connection uses — this adds a way to obtain one, not a second kind of credential.

CREATE TABLE IF NOT EXISTS public.oauth_clients (
  client_id TEXT NOT NULL PRIMARY KEY,
  client_name TEXT,
  redirect_uris TEXT[] NOT NULL,
  /** Public clients only: an MCP client on someone's laptop cannot keep a secret. */
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.oauth_codes (
  code TEXT NOT NULL PRIMARY KEY,
  client_id TEXT REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  redirect_uri TEXT NOT NULL,
  /** PKCE is required, so a code intercepted in transit is useless on its own. */
  code_challenge TEXT NOT NULL,
  code_challenge_method TEXT NOT NULL DEFAULT 'S256',
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read', 'write'],
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_oauth_codes_expiry ON public.oauth_codes(expires_at) WHERE used_at IS NULL;

-- Both tables are written only by the OAuth endpoints, which run with the service key.
-- Nothing here should be readable by a signed-in user, and nothing needs to be.
ALTER TABLE public.oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_codes ENABLE ROW LEVEL SECURITY;

-- A client's own name and redirect list, so the approval screen can say who is asking.
CREATE POLICY "Anyone signed in can read a client's public details" ON public.oauth_clients FOR SELECT TO authenticated USING (true);

-- Tokens minted through OAuth are the same rows a pasted token uses; this records which
-- client obtained one, so the user can tell them apart when revoking.
ALTER TABLE public.agent_tokens
  ADD COLUMN IF NOT EXISTS client_id TEXT REFERENCES public.oauth_clients(client_id) ON DELETE SET NULL;

/**
 * Exchanges an approved authorisation for a one-time code.
 *
 * Runs as the signed-in user and writes a row nothing else can, which is why it is
 * SECURITY DEFINER: the approval screen is the only place a code may be created, and only
 * for a profile the caller actually controls.
 */
CREATE OR REPLACE FUNCTION public.create_oauth_code(
  p_client_id text,
  p_profile_id uuid,
  p_redirect_uri text,
  p_code_challenge text
)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_code text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be signed in to approve a connection';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = p_profile_id AND (p.user_id = auth.uid() OR p.owner_user_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'That profile is not yours';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.oauth_clients c
    WHERE c.client_id = p_client_id AND p_redirect_uri = ANY (c.redirect_uris)
  ) THEN
    RAISE EXCEPTION 'Unknown client or redirect URI';
  END IF;

  new_code := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

  INSERT INTO public.oauth_codes (code, client_id, profile_id, redirect_uri, code_challenge)
  VALUES (new_code, p_client_id, p_profile_id, p_redirect_uri, p_code_challenge);

  RETURN new_code;
END;
$$;
