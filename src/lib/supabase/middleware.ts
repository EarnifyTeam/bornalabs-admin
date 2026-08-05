import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { type Database } from "./types";
import { envConfig } from "@/config/env";

export function createMiddlewareSupabaseClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.supabaseUrl;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || envConfig.supabaseAnonKey;

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: "",
          ...options,
        });
      },
    },
  });

  return { supabase, response };
}

export async function updateSession(request: NextRequest) {
  const { supabase, response } = createMiddlewareSupabaseClient(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("placeholder") || supabaseUrl.includes("your-project-id")) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const bornaSession = request.cookies.get("borna_session")?.value;

  const userRole = user?.user_metadata?.role || "CUSTOMER";
  const isAdminRole = ["SUPER_ADMIN", "ADMIN", "MANAGER", "SUPPORT"].includes(userRole);

  const isAuthenticatedAdmin = (!!user && isAdminRole) || !!bornaSession;

  const { pathname } = request.nextUrl;
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  const isDashboardPage =
    pathname === "/" ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/extensions") ||
    pathname.startsWith("/licenses") ||
    pathname.startsWith("/settings");

  // Redirect unauthenticated or non-admin users accessing protected routes to /login
  if (isDashboardPage && !isAuthenticatedAdmin) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated admin users accessing auth routes to /
  if (isAuthPage && isAuthenticatedAdmin) {
    const dashboardUrl = new URL("/", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
