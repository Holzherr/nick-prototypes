-- Schedules the work that must not happen while someone waits.
--
-- Serving a recommendation request ranks saved data and returns in a couple of seconds; the
-- model-scored version is produced here instead. Availability is refreshed on the same
-- principle: nobody should sit through a page fetch to find out where a film streams.
--
-- The credential stays in Supabase Vault rather than in this file, because both repositories
-- are public. Before the jobs can run, store it once:
--
--   select vault.create_secret('<service-role key>', 'service_role_key');
--
-- Until that secret exists the jobs are scheduled but each run exits without doing anything,
-- which is the safe direction to fail in.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

/**
 * Calls one of our edge functions. Reads the key from Vault at call time so it is never
 * written into a migration, a workflow file, or a log line.
 */
CREATE OR REPLACE FUNCTION public.invoke_function(p_name text, p_body jsonb)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, vault AS $$
DECLARE
  key text;
  request_id bigint;
BEGIN
  SELECT decrypted_secret INTO key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  IF key IS NULL THEN
    RAISE NOTICE 'service_role_key is not in the vault; skipping %', p_name;
    RETURN NULL;
  END IF;

  SELECT net.http_post(
    url := 'https://piwfcsvnxcmxmvfhgtbk.supabase.co/functions/v1/' || p_name,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || key),
    body := p_body,
    timeout_milliseconds := 180000
  ) INTO request_id;

  RETURN request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.invoke_function(text, jsonb) FROM public, anon, authenticated;

/**
 * Refreshes the model-scored slate for every profile that has anything on its list.
 * One call per profile, so cost scales with real users rather than catalogue size.
 */
CREATE OR REPLACE FUNCTION public.refresh_recommendation_slates()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  profile record;
  refreshed integer := 0;
BEGIN
  FOR profile IN
    SELECT p.id, coalesce(p.user_id, p.owner_user_id) AS account
    FROM public.profiles p
    WHERE EXISTS (SELECT 1 FROM public.watch_entries e WHERE e.profile_id = p.id)
  LOOP
    PERFORM public.invoke_function(
      'get-recommendations',
      jsonb_build_object('user_id', coalesce(profile.account, profile.id), 'profile_id', profile.id, 'mode', 'refresh')
    );
    refreshed := refreshed + 1;
  END LOOP;

  RETURN refreshed;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_recommendation_slates() FROM public, anon, authenticated;

-- Overnight, when a slow model call costs nobody anything.
SELECT cron.schedule('qeued-refresh-slates', '17 3 * * *', 'SELECT public.refresh_recommendation_slates();');

-- Availability churns monthly, so a nightly sweep of whatever has passed its expiry keeps
-- the whole catalogue current without ever re-fetching everything at once. The sweep runs
-- outside the database (tools/availability.mjs --stale) because it parses pages; this job
-- only clears the flag that marks rows as due.
UPDATE public.title_availability
SET expires_at = least(expires_at, now() + interval '30 days')
WHERE removed_at IS NULL;
