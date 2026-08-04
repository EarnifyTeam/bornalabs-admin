import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Key, 
  Download, 
  DollarSign, 
  Activity, 
  AlertCircle 
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { title: "Total Users", value: "0", label: "Foundation Placeholder", icon: Users, accent: "cyan" },
    { title: "Active Licenses", value: "0", label: "Foundation Placeholder", icon: Key, accent: "violet" },
    { title: "Global Downloads", value: "0", label: "Foundation Placeholder", icon: Download, accent: "gold" },
    { title: "Monthly Net Revenue", value: "$0.00", label: "Foundation Placeholder", icon: DollarSign, accent: "green" },
  ];

  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">Executive Dashboard</h2>
          <p className="text-xs text-muted">Real-time control center metrics of BornaLabs systems (Phase 1 Foundation UI).</p>
        </div>
        <span className="text-[10px] bg-cyan/10 border border-cyan/20 text-cyan font-bold px-3 py-1.5 rounded-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          Foundation Mode
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={i} accent={stat.accent as any} className="flex flex-col gap-3 relative">
              <div className="flex justify-between items-center text-muted">
                <span className="text-[11px] font-bold uppercase tracking-wider">{stat.title}</span>
                <Icon className="w-4 h-4 text-muted" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-bricolage text-white">{stat.value}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-muted">{stat.label}</span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Secondary Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Telemetry Handshakes */}
        <GlassCard className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div>
              <h3 className="font-bricolage font-bold text-sm text-white">Telemetry Handshakes</h3>
              <p className="text-[10px] text-muted">Active client instances validation checkups.</p>
            </div>
            <span className="flex items-center gap-1.5 text-[9px] font-bold bg-green/10 border border-green/20 text-green px-2 py-0.5 rounded-sm uppercase">
              <Activity className="w-2.5 h-2.5" />
              Live Stream
            </span>
          </div>

          <div className="text-center py-12 text-muted flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-6 h-6 text-muted/60" />
            <span>Telemetry telemetry stream placeholder (Phase 1 Foundation).</span>
          </div>
        </GlassCard>

        {/* Active Product Release Summary */}
        <GlassCard className="flex flex-col gap-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bricolage font-bold text-sm text-white">Active Releases</h3>
            <p className="text-[10px] text-muted">Active client version deployments status.</p>
          </div>

          <div className="text-center py-12 text-muted flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-6 h-6 text-muted/60" />
            <span>Releases view placeholder.</span>
          </div>
        </GlassCard>
      </div>

      {/* Recent Transactions List */}
      <GlassCard className="flex flex-col gap-4">
        <div className="border-b border-border pb-3">
          <h3 className="font-bricolage font-bold text-sm text-white">Recent Transactions</h3>
          <p className="text-[10px] text-muted">SaaS invoice generation and orders updates.</p>
        </div>

        <div className="text-center py-8 text-muted flex items-center justify-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-muted/60" />
          <span>Transactions table placeholder (Phase 1 Foundation).</span>
        </div>
      </GlassCard>
    </div>
  );
}
