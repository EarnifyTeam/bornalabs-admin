"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Key, Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { GlassCard } from "@/components/glass-card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        // Direct redirect to main dashboard
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Failed to connect to authentication server.");
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
            <p className="text-[10px] text-muted tracking-wider uppercase font-semibold">Build. Create. Automate.</p>
          </div>
        </div>

        {error && (
          <div className="border border-red/20 bg-red/5 text-red text-[11px] p-3 rounded-sm text-center font-semibold">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-bold text-[10px] uppercase">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bornalabs.com"
                className="bg-surface2/40 border border-border rounded-sm py-2 pl-9 pr-4 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-muted font-bold text-[10px] uppercase">Password</label>
              <a href="/forgot-password" className="text-[9px] text-cyan hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3 top-2.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-surface2/40 border border-border rounded-sm py-2 pl-9 pr-10 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-center text-xs font-bold text-white bg-gradient-to-tr from-cyan to-violet py-2.5 rounded-sm shadow-md hover:opacity-90 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating Session..." : "Secure Login"}
          </button>
        </form>

        <div className="text-center text-[10px] text-muted flex items-center justify-center gap-1.5 border-t border-border pt-4">
          <Shield className="w-3.5 h-3.5 text-green" />
          End-to-End Encrypted Handshake
        </div>
      </GlassCard>
    </div>
  );
}
