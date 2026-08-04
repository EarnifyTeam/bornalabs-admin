export const envConfig = {
  get supabaseUrl() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  },
  get supabaseAnonKey() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  },
  get supabaseServiceKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  },
};

export interface EnvValidationResult {
  isValid: boolean;
  missingKeys: string[];
  errorMessage?: string;
}

export function validateSupabaseConfig(): EnvValidationResult {
  const missingKeys: string[] = [];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.supabaseUrl;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || envConfig.supabaseAnonKey;

  if (
    !url ||
    url.includes("your-project-id") ||
    url.includes("YOUR_PROJECT") ||
    url.includes("placeholder")
  ) {
    missingKeys.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (
    !anonKey ||
    anonKey.includes("your-supabase-anon-key") ||
    anonKey.includes("YOUR_ANON_KEY") ||
    anonKey.includes("placeholder")
  ) {
    missingKeys.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const isValid = missingKeys.length === 0;

  return {
    isValid,
    missingKeys,
    errorMessage: isValid
      ? undefined
      : `[Supabase Config Error] Missing or unconfigured environment variables: ${missingKeys.join(", ")}. Please configure environment variables.`,
  };
}
