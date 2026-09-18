// Supabase config comes from the environment (.env.local, or the publish workflow's repo variables), so a
// checkout never points at someone else's database. Left blank, the app runs without accounts or cloud sync.
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/**
 * "Continue with Google" needs a Google Cloud OAuth client (id + secret) pasted into the Supabase
 * dashboard under Authentication → Sign In / Providers → Google. Until that exists the provider is
 * disabled server-side and the button only ever returned "Unsupported provider", so it is not shown.
 *
 * Turn this on in the same change that enables the provider — a true here with the provider still off
 * puts a broken button back in front of every new parent.
 */
export const GOOGLE_SIGN_IN = false;
