"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, RefreshCw, Server, ShieldCheck, Activity } from "lucide-react";

interface HealthData {
  status: string;
  connected: boolean;
  message?: string;
  supabaseUrl?: string;
  sessionHandshake?: string;
  latencyMs?: string;
  timestamp?: string;
  error?: string;
}

/**
 * DEVELOPMENT ONLY - Supabase Health Verification Dashboard Page
 */
export default function SupabaseStatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health/supabase");
      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      setHealth({
        status: "ERROR",
        connected: false,
        error: "Failed to connect to /api/health/supabase",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="flex flex-col gap-6 text-xs max-w-3xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="font-bricolage font-bold text-xl text-white">Supabase Connection Diagnostics</h2>
            <Badge variant="warning">[DEVELOPMENT ONLY]</Badge>
          </div>
          <p className="text-xs text-muted">Phase 2A Live Network Handshake Verification for `.env.local` Supabase URL.</p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan" : ""}`} />}
          onClick={fetchHealth}
        >
          Re-test Connection
        </Button>
      </div>

      <GlassCard className="flex flex-col gap-6 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-muted">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan" />
            <span>Pinging Supabase server endpoint...</span>
          </div>
        ) : health?.connected ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 p-4 border border-green/30 bg-green/10 rounded-md">
              <CheckCircle2 className="w-8 h-8 text-green shrink-0" />
              <div>
                <h3 className="font-bricolage font-bold text-sm text-green">{health.message}</h3>
                <p className="text-[11px] text-foreground/80 mt-0.5">
                  Supabase endpoint responded cleanly in <span className="font-bold text-cyan">{health.latencyMs}</span>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col p-4 bg-surface2/30 border border-border rounded-sm">
                <span className="text-[10px] font-bold text-muted uppercase">Target Supabase URL</span>
                <span className="font-mono text-cyan font-semibold text-xs mt-1 truncate">{health.supabaseUrl}</span>
              </div>

              <div className="flex flex-col p-4 bg-surface2/30 border border-border rounded-sm">
                <span className="text-[10px] font-bold text-muted uppercase">Auth Session Handshake</span>
                <span className="font-mono text-green font-semibold text-xs mt-1">{health.sessionHandshake}</span>
              </div>

              <div className="flex flex-col p-4 bg-surface2/30 border border-border rounded-sm">
                <span className="text-[10px] font-bold text-muted uppercase">Response Latency</span>
                <span className="font-mono text-gold font-semibold text-xs mt-1">{health.latencyMs}</span>
              </div>

              <div className="flex flex-col p-4 bg-surface2/30 border border-border rounded-sm">
                <span className="text-[10px] font-bold text-muted uppercase">Verification Timestamp</span>
                <span className="font-mono text-foreground font-semibold text-[10px] mt-1">{health.timestamp}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border text-[10px] text-muted">
              <ShieldCheck className="w-4 h-4 text-green" />
              <span>Production Supabase SDK clients in <code className="text-white">src/lib/supabase/</code> are fully operational.</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 border border-red/30 bg-red/10 rounded-md text-red">
              <AlertTriangle className="w-8 h-8 text-red shrink-0" />
              <div>
                <h3 className="font-bricolage font-bold text-sm">Supabase Connection Failed</h3>
                <p className="text-[11px] mt-0.5">{health?.error || "Unknown connection error."}</p>
              </div>
            </div>

            <p className="text-[11px] text-muted">
              Please verify that <code className="text-white">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-white">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are correctly set in your <code className="text-white">.env.local</code> file.
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
