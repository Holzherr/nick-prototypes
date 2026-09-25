/// <reference types="vite/client" />
interface ImportMetaEnv { // the Maths Garden Supabase project, see .env.example; both blank in tests and local dev
  readonly VITE_SUPABASE_URL: string | undefined;
  readonly VITE_SUPABASE_ANON_KEY: string | undefined;
}
