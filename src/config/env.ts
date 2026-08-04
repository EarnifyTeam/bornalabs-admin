export const envConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

export interface EnvValidationResult {
  isValid: boolean;
  missingKeys: string[];
  errorMessage?: string;
}

export function validateSupabaseConfig(): EnvValidationResult {
  const missingKeys: string[] = [];

  if (
    !envConfig.supabaseUrl ||
    envConfig.supabaseUrl.includes("your-project-id") ||
    envConfig.supabaseUrl.includes("YOUR_PROJECT") ||
    envConfig.supabaseUrl.includes("placeholder")
  ) {
    missingKeys.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (
    !envConfig.supabaseAnonKey ||
    envConfig.supabaseAnonKey.includes("your-supabase-anon-key") ||
    envConfig.supabaseAnonKey.includes("YOUR_ANON_KEY") ||
    envConfig.supabaseAnonKey.includes("placeholder")
  ) {
    missingKeys.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const isValid = missingKeys.length === 0;

  return {
    isValid,
    missingKeys,
    errorMessage: isValid
      ? undefined
      : `[Supabase Config Error] Missing or unconfigured environment variables: ${missingKeys.join(", ")}. Please configure them in your .env or .env.local file.`,
  };
}
