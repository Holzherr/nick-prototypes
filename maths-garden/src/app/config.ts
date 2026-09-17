// Public Supabase config for the maths-garden project (gzdfoptvdocauvgxltjk, own account
// nickholzherr+maths@gmail.com). The publishable key is safe to ship; row-level security does the gating.
export const SUPABASE_URL = 'https://gzdfoptvdocauvgxltjk.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_b7V7vEv3xUtEZf3uFPrQAg_BX1uAqCH';

/**
 * "Continue with Google" needs a Google Cloud OAuth client (id + secret) pasted into the Supabase
 * dashboard under Authentication → Sign In / Providers → Google. Until that exists the provider is
 * disabled server-side and the button only ever returned "Unsupported provider", so it is not shown.
 *
 * Turn this on in the same change that enables the provider — a true here with the provider still off
 * puts a broken button back in front of every new parent.
 */
export const GOOGLE_SIGN_IN = false;
