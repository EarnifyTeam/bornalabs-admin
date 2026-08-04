export const envConfig = {
  get supabaseUrl() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || "https://iuzdqwgdetxyxyqsfvet.supabase.co";
  },
  get supabaseAnonKey() {
    return (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1emRxd2dkZXR4eXh5cXNmdmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MjQ5NDksImV4cCI6MjA5OTUwMDk0OX0.eEMEHcEcqKv-_YSfaEIu2DyU8dh-NOM0IdKv-M2EmBs"
    );
  },
  get supabaseServiceKey() {
    return (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1emRxd2dkZXR4eXh5cXNmdmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MjQ5NDksImV4cCI6MjA5OTUwMDk0OX0.eEMEHcEcqKv-_YSfaEIu2DyU8dh-NOM0IdKv-M2EmBs"
    );
  },
};

export interface EnvValidationResult {
  isValid: boolean;
  missingKeys: string[];
  errorMessage?: string;
}

export function validateSupabaseConfig(): EnvValidationResult {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.supabaseUrl;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || envConfig.supabaseAnonKey;

  const missingKeys: string[] = [];

  if (!url) {
    missingKeys.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!anonKey) {
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
