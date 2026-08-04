import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
      return NextResponse.json(
        {
          connected: false,
          error: "Supabase environment variables missing or unconfigured.",
        },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        {
          connected: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      connected: true,
      message: "✅ Supabase Connection Verified Successfully!",
      supabaseUrl,
      sessionStatus: data.session ? "Active Session" : "No Active Session (Public Handshake OK)",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        connected: false,
        error: err.message || "Failed to establish connection with Supabase.",
      },
      { status: 500 }
    );
  }
}
