import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/app/config';
import { cloudConfigured } from '@/shared/supabase/client';

/**
 * Whether Supabase has the Google provider switched on, asked of the project itself. The button used to hang
 * off a constant in config.ts, which meant a deploy to show it and — worse — a broken "Unsupported provider"
 * button whenever the constant and the dashboard disagreed. Now switching the provider on in the dashboard is
 * the whole job, and switching it off hides the button again.
 */
export async function googleEnabled(fetcher: typeof fetch = fetch): Promise<boolean> {
  if (!cloudConfigured) return false;
  try {
    const response = await fetcher(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY } });
    if (!response.ok) return false;
    const settings = (await response.json()) as { external?: { google?: boolean } };
    return settings.external?.google === true;
  } catch {
    return false;
  }
}
