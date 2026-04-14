import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isDev = import.meta.env.DEV;

type SupabaseClientType = ReturnType<typeof createClient> | null;

let cachedClient: SupabaseClientType | undefined;

export function getSupabaseClient(): SupabaseClientType {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isDev) {
      console.info("Google OAuth disabled: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Supabase login.");
    }
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}

export const supabase = getSupabaseClient();
