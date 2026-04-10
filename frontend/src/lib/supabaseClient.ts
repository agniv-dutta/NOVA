import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

type SupabaseClientType = ReturnType<typeof createClient> | null;

let cachedClient: SupabaseClientType | undefined;

export function getSupabaseClient(): SupabaseClientType {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase env vars missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}

export const supabase = getSupabaseClient();
