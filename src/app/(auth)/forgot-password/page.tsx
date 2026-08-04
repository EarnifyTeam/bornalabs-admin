"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/glass-card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
            <h2 className="font-bricolage font-bold text-lg tracking-tight">Reset Password</h2>
            <p className="text-[10px] text-muted">We will send a reset link to your administrator email.</p>
          </div>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center text-center gap-3 p-4 border border-green/20 bg-green/5 rounded-sm">
            <CheckCircle2 className="w-8 h-8 text-green animate-bounce" />
            <div className="text-xs">
              <p className="font-bold text-foreground">Reset Link Transmitted</p>
              <p className="text-muted mt-1">If {email} is registered, you will receive password reset instructions shortly.</p>
            </div>
            <Link href="/login" className="text-cyan text-[11px] font-bold mt-2 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              className="w-full text-center text-xs font-bold text-white bg-gradient-to-tr from-cyan to-violet py-2.5 rounded-sm shadow-md hover:opacity-90 transition-all mt-2"
            >
              Send Reset Instructions
            </button>

            <Link href="/login" className="text-muted hover:text-foreground text-[10px] font-semibold text-center mt-2 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
            </Link>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
