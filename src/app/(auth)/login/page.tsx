"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Shield, Eye, EyeOff, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { isConfigValid, missingConfigKeys } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Supabase Verification Status
  const [connectionStatus, setConnectionStatus] = useState<{
    checked: boolean;
    connected: boolean;
    message?: string;
    url?: string;
  }>({ checked: false, connected: false });

  const supabase = createClient();

  useEffect(() => {
    async function verifyConnection() {
      try {
        const res = await fetch("/api/supabase/verify");
        const data = await res.json();
        if (res.ok && data.connected) {
          setConnectionStatus({
            checked: true,
            connected: true,
            message: data.message,
            url: data.supabaseUrl,
          });
        } else {
          setConnectionStatus({
            checked: true,
            connected: false,
            message: data.error || "Failed to verify Supabase connection.",
          });
        }
      } catch (err) {
        setConnectionStatus({
          checked: true,
          connected: false,
          message: "Unable to reach Supabase API endpoint.",
        });
      }
    }

    verifyConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Try Supabase Auth first
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!authError) {
        router.push("/");
        router.refresh();
        return;
      }

      // 2. Fallback to Internal Prisma API Authentication
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(
          data.error === "INVALID_CREDENTIALS"
            ? "Invalid email or password."
            : authError.message || "Failed to authenticate session."
        );
      }
    } catch (err: any) {
      setError("Connection error to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-foreground relative flex items-center justify-center p-4">
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-cyan/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-violet/5 blur-[100px] pointer-events-none" />

      <GlassCard hoverable={false} className="w-full max-w-sm flex flex-col gap-6 p-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan to-violet flex items-center justify-center font-bricolage text-base font-bold shadow-lg shadow-cyan/15 text-white">
            BL
          </div>
          <div>
            <h2 className="font-bricolage font-bold text-lg tracking-tight">BornaLabs Control Center</h2>
            <p className="text-[10px] text-muted tracking-wider uppercase font-semibold">Production Supabase Auth</p>
          </div>
        </div>

        {/* Supabase Live Connection Banner */}
        {connectionStatus.checked && (
          <div
            className={`border text-[10px] p-3 rounded-sm flex items-start gap-2 ${
              connectionStatus.connected
                ? "border-green/30 bg-green/5 text-green"
                : "border-red/30 bg-red/5 text-red"
            }`}
          >
            {connectionStatus.connected ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red" />
            )}
            <div>
              <p className="font-bold">{connectionStatus.message}</p>
              {connectionStatus.url && (
                <p className="font-mono text-[9px] mt-0.5 opacity-80">{connectionStatus.url}</p>
              )}
            </div>
          </div>
        )}

        {!isConfigValid && (
          <div className="border border-gold/30 bg-gold/5 text-gold text-[10px] p-3 rounded-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Missing Environment Variables:</span>
              <ul className="list-disc list-inside mt-1 font-mono text-[9px]">
                {missingConfigKeys.map((key) => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
              <p className="mt-1 text-[9px] text-muted">Configure keys in environment variables.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="border border-red/20 bg-red/5 text-red text-[11px] p-3 rounded-sm text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@bornalabs.com"
            leftIcon={<Mail className="w-4 h-4 text-muted" />}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-muted font-bold text-[10px] uppercase">Password</label>
              <a href="/forgot-password" className="text-[9px] text-cyan hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-muted" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="md"
            className="w-full mt-2"
          >
            {loading ? "Authenticating Session..." : "Secure Login"}
          </Button>
        </form>

        <div className="text-center text-[10px] text-muted flex items-center justify-center gap-1.5 border-t border-border pt-4">
          <Shield className="w-3.5 h-3.5 text-green" />
          End-to-End Encrypted Handshake
        </div>
      </GlassCard>
    </div>
  );
}
