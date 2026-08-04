import { NextResponse } from "next/server";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

/**
 * DEVELOPMENT ONLY - Supabase Live Connection Health Check Endpoint
 */
export async function GET() {
  const startTime = Date.now();
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("YOUR_PROJECT") || supabaseUrl.includes("placeholder")) {
      return NextResponse.json(
        {
          status: "ERROR",
          connected: false,
          error: "Supabase environment variables missing or unconfigured.",
          missingKeys: [
            !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : "",
            !supabaseAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : "",
          ].filter(Boolean),
        },
        { status: 400 }
      );
    }

    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.auth.getSession();

    const latencyMs = Date.now() - startTime;

    if (error) {
      return NextResponse.json(
        {
          status: "FAILED",
          connected: false,
          error: error.message,
          latencyMs,
          supabaseUrl,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "SUCCESS",
      connected: true,
      message: "✅ Supabase Live Connection Established & Verified!",
      supabaseUrl,
      sessionHandshake: data ? "PASSED" : "FAILED",
      latencyMs: `${latencyMs}ms`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "EXCEPTION",
        connected: false,
        error: err.message || "Failed to reach Supabase server endpoint.",
        latencyMs: `${Date.now() - startTime}ms`,
      },
      { status: 500 }
    );
  }
}
