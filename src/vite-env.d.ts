/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Public origin for share tags, e.g. https://itclub.ucas.edu.ps */
  readonly VITE_SITE_URL?: string;
}
