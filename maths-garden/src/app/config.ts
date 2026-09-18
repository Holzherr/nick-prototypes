// Supabase config comes from the environment (.env.local, or the publish workflow's repo variables), so a
// checkout never points at someone else's database. Left blank, the app runs without accounts or cloud sync.
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
