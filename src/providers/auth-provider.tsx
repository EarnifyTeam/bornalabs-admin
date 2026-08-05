"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User as SupabaseUser, type Session } from "@supabase/supabase-js";
import { validateSupabaseConfig } from "@/config/env";

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

  const { isValid: isConfigValid, missingKeys: missingConfigKeys } = validateSupabaseConfig();
  const supabase = createClient();

  const syncUserState = (activeSession: Session | null) => {
    if (activeSession?.user) {
      setSession(activeSession);
      setSupabaseUser(activeSession.user);
      const userRole = activeSession.user.user_metadata?.role || "CUSTOMER";
      const isAdminRole = ["SUPER_ADMIN", "ADMIN", "MANAGER", "SUPPORT"].includes(userRole);

      setUser({
        id: activeSession.user.id,
        email: activeSession.user.email || "",
        fullName:
          activeSession.user.user_metadata?.full_name ||
          activeSession.user.email?.split("@")[0] ||
          "User",
        role: userRole,
        isAuthenticated: isAdminRole,
      });
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
    } catch (err) {
      console.error("Error refreshing session:", err);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession?.user) {
          syncUserState(currentSession);
        } else {
          // Check internal database session fallback
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

    // Listen to Auth State Changes (Persistent Login & Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      syncUserState(newSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigValid]);

  const signOut = async () => {
    try {
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
