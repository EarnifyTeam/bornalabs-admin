"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User as SupabaseUser } from "@supabase/supabase-js";

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
  loading: boolean;
  signOut: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Fetch initial user session
    const getUserSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSupabaseUser(session.user);
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            fullName: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Admin",
            role: session.user.user_metadata?.role || "SUPER_ADMIN",
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserSession();

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          fullName: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Admin",
          role: session.user.user_metadata?.role || "SUPER_ADMIN",
          isAuthenticated: true,
        });
      } else {
        setSupabaseUser(null);
        setUser(defaultAuthUser);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(defaultAuthUser);
    setSupabaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signOut }}>
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
