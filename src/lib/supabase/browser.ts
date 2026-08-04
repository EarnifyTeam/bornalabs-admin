import { createBrowserClient } from "@supabase/ssr";
import { type Database } from "./types";
import { envConfig } from "@/config/env";

export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.supabaseUrl;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || envConfig.supabaseAnonKey;

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
