export const envConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

export function validateSupabaseConfig(): { isValid: boolean; missingKeys: string[] } {
  const missingKeys: string[] = [];

  if (!envConfig.supabaseUrl || envConfig.supabaseUrl.includes("placeholder")) {
    missingKeys.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!envConfig.supabaseAnonKey || envConfig.supabaseAnonKey.includes("placeholder")) {
    missingKeys.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
}
