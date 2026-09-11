import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/app/config';
import type { Database } from './types';

export const cloudConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// The placeholder URL only keeps Storybook and tests booting while config.ts is blank.
export const supabase = createClient<Database>(SUPABASE_URL || 'http://localhost:54321', SUPABASE_ANON_KEY || 'anon', {
  auth: { storage: localStorage, persistSession: true, autoRefreshToken: true },
});
