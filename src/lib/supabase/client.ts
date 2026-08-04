import { createBrowserSupabaseClient } from "./browser";

// Unified entry point for client-side Supabase usage
export function createClient() {
  return createBrowserSupabaseClient();
}

export { createBrowserSupabaseClient };
