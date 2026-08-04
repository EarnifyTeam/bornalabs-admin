"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, Shield } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message || "Failed to update password.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: any) {
      setError("Error updating password in Supabase Auth.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-foreground relative flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-cyan/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-violet/5 blur-[100px] pointer-events-none" />

      <GlassCard hoverable={false} className="w-full max-w-sm flex flex-col gap-6 p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan to-violet flex items-center justify-center font-bricolage text-base font-bold shadow-lg shadow-cyan/15 text-white">
            BL
          </div>
          <div>
            <h2 className="font-bricolage font-bold text-lg tracking-tight">Set New Password</h2>
            <p className="text-[10px] text-muted">Enter a new secure password for your account.</p>
          </div>
        </div>

        {error && (
          <div className="border border-red/20 bg-red/5 text-red text-[11px] p-3 rounded-sm text-center font-semibold">
            {error}
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center text-center gap-3 p-4 border border-green/20 bg-green/5 rounded-sm">
            <CheckCircle2 className="w-8 h-8 text-green animate-bounce" />
            <div className="text-xs">
              <p className="font-bold text-foreground">Password Updated Successfully</p>
              <p className="text-muted mt-1">Redirecting to login page...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
            <Input
              label="New Password"
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

            <Input
              label="Confirm New Password"
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-muted" />}
            />

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="md"
              className="w-full mt-2"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        )}

        <div className="text-center text-[10px] text-muted flex items-center justify-center gap-1.5 border-t border-border pt-4">
          <Shield className="w-3.5 h-3.5 text-green" />
          End-to-End Encrypted Handshake
        </div>
      </GlassCard>
    </div>
  );
}
