"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User as SupabaseUser, type Session } from "@supabase/supabase-js";
import { validateSupabaseConfig } from "@/config/env";

const ADMIN_SESSION_MAX_AGE_MS = 60 * 60 * 1000; // 60 Minutes Auto Logout Timer

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: AuthUser;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  isConfigValid: boolean;
  missingConfigKeys: string[];
  sessionTimeLeftMinutes: number | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const defaultAuthUser: AuthUser = {
  id: "",
  email: "",
  fullName: "Guest User",
  role: "SUPPORT",
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(defaultAuthUser);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeLeftMinutes, setSessionTimeLeftMinutes] = useState<number | null>(60);

  const { isValid: isConfigValid, missingKeys: missingConfigKeys } = validateSupabaseConfig();
  const supabase = createClient();

  const resetAdminSessionTimer = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_session_start_time", Date.now().toString());
    }
  };

  const handleSignOutExpired = async () => {
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("admin_session_start_time");
      }
      await supabase.auth.signOut().catch(() => {});
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      setUser(defaultAuthUser);
      setSession(null);
      setSupabaseUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login?reason=session_expired";
      }
    } catch (err) {
      console.error("Admin sign out error:", err);
    } finally {
      setLoading(false);
    }
  };

  const syncUserState = (activeSession: Session | null) => {
    if (activeSession?.user) {
      setSession(activeSession);
      setSupabaseUser(activeSession.user);
      const userEmail = (activeSession.user.email || "").toLowerCase().trim();
      const isMasterAdmin = userEmail === "kumarsuraj0469@gmail.com";
      const userRole = activeSession.user.user_metadata?.role || (isMasterAdmin ? "SUPER_ADMIN" : "CUSTOMER");
      const isAdminRole = ["SUPER_ADMIN", "ADMIN", "MANAGER", "SUPPORT"].includes(userRole) || isMasterAdmin;

      setUser({
        id: activeSession.user.id,
        email: activeSession.user.email || "",
        fullName:
          activeSession.user.user_metadata?.full_name ||
          activeSession.user.email?.split("@")[0] ||
          "User",
        role: isMasterAdmin ? "SUPER_ADMIN" : userRole,
        isAuthenticated: isAdminRole,
      });

      if (typeof window !== "undefined" && !window.localStorage.getItem("admin_session_start_time")) {
        resetAdminSessionTimer();
      }
    } else {
      setSession(null);
      setSupabaseUser(null);
      setUser(defaultAuthUser);
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
      syncUserState(refreshedSession);
      resetAdminSessionTimer();
    } catch (err) {
      console.error("Error refreshing session:", err);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession?.user) {
          syncUserState(currentSession);
        } else {
          const res = await fetch("/api/user/dashboard").catch(() => null);
          if (res && res.ok) {
            const data = await res.json().catch(() => null);
            if (data?.user) {
              const dbRole = data.user.role || "CUSTOMER";
              const isAdminRole = ["SUPER_ADMIN", "ADMIN", "MANAGER", "SUPPORT"].includes(dbRole);
              setUser({
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.fullName || "Admin User",
                role: dbRole,
                isAuthenticated: isAdminRole,
              });
              setLoading(false);
              return;
            }
          }
          syncUserState(null);
        }
      } catch (error) {
        console.error("Error restoring session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      syncUserState(newSession);
      if (newSession) resetAdminSessionTimer();
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigValid]);

  // 60-Minute Admin Auto Logout Expiry Checker
  useEffect(() => {
    if (!user.isAuthenticated) return;

    const interval = setInterval(() => {
      if (typeof window === "undefined") return;
      const startTimeStr = window.localStorage.getItem("admin_session_start_time");
      if (!startTimeStr) {
        resetAdminSessionTimer();
        return;
      }

      const startTime = parseInt(startTimeStr, 10);
      const elapsedMs = Date.now() - startTime;
      const remainingMs = ADMIN_SESSION_MAX_AGE_MS - elapsedMs;

      if (remainingMs <= 0) {
        clearInterval(interval);
        handleSignOutExpired();
      } else {
        setSessionTimeLeftMinutes(Math.ceil(remainingMs / (60 * 1000)));
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [user.isAuthenticated]);

  const signOut = async () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("admin_session_start_time");
      }
      await supabase.auth.signOut().catch(() => {});
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      syncUserState(null);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        loading,
        isConfigValid,
        missingConfigKeys,
        sessionTimeLeftMinutes,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
