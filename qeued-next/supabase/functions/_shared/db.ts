import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/** Service-role client; every function runs with RLS bypassed and gates access in _shared/access.ts. */
export const serviceClient = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

/** Resolves a user's JWT to their id through the auth server; null for the anon key or a bad token. */
export const userIdFromJwt = async (jwt: string): Promise<string | null> => {
  const anon = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anon.auth.getUser(jwt);
  return error || !data.user ? null : data.user.id;
};
