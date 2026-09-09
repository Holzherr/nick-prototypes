import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/** Service-role client; every function runs with RLS bypassed and gates on its own inputs. */
export const serviceClient = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
