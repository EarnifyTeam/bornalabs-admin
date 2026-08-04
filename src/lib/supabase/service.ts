import { createClient } from "@supabase/supabase-js";
import { envConfig } from "@/config/env";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.supabaseUrl;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || envConfig.supabaseServiceKey;

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
