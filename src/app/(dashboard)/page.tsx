"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";
import { 
  Key, 
  Package, 
  Download, 
  Bell, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Smartphone, 
  Clock,
  Sparkles,
  ArrowRight,
  LifeBuoy
} from "lucide-react";

interface UserDashboardData {
  user: {
    fullName: string;
    email: string;
    role: string;
    status: string;
  };
  stats: {
    totalLicenses: number;
    activeLicenses: number;
    assignedProductsCount: number;
    totalDownloadsCount: number;
  };
  products: Array<{
    id: string;
    name: string;
    category: string;
    version: string;
    downloadUrl?: string;
    documentationUrl?: string;
    iconUrl?: string;
  }>;
  licenses: Array<{
    id: string;
    licenseKey: string;
    type: string;
    status: string;
    deviceLimit: number;
    expiresAt?: string | null;
    product?: {
      name: string;
    };
    devices?: any[];
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
  }>;
}

export default function UserDashboardHomePage() {
  const toast = useToast();
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/user/dashboard");
        const json = await res.json();
        if (res.ok) {
          setData(json);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("License key copied to clipboard!");
  };

  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Welcome Banner */}
      <GlassCard accent="cyan" className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="font-bricolage font-bold text-2xl text-white">
              Welcome back, {data?.user?.fullName || "User"}!
            </h1>
            <Badge variant="active" className="text-[10px]">CUSTOMER PORTAL</Badge>
          </div>
          <p className="text-xs text-muted">
            Access your assigned BornaLabs software, manage active license keys, and download installer releases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/support">
            <Button variant="secondary" size="sm" icon={<LifeBuoy className="w-3.5 h-3.5 text-cyan" />}>
              Helpdesk Support
            </Button>
          </Link>
        </div>
      </GlassCard>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard accent="cyan" className="flex justify-between items-center p-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Assigned Software</span>
            <span className="text-2xl font-bold font-bricolage text-white mt-1">{data?.stats?.assignedProductsCount || 0}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan">
            <Package className="w-4 h-4" />
          </div>
        </GlassCard>

        <GlassCard accent="green" className="flex justify-between items-center p-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Active License Keys</span>
            <span className="text-2xl font-bold font-bricolage text-green mt-1">{data?.stats?.activeLicenses || 0}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-green/10 border border-green/20 flex items-center justify-center text-green">
            <Key className="w-4 h-4" />
          </div>
        </GlassCard>

        <GlassCard accent="gold" className="flex justify-between items-center p-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Recent Downloads</span>
            <span className="text-2xl font-bold font-bricolage text-gold mt-1">{data?.stats?.totalDownloadsCount || 0}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
            <Download className="w-4 h-4" />
          </div>
        </GlassCard>

        <GlassCard accent="violet" className="flex justify-between items-center p-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Announcements</span>
            <span className="text-2xl font-bold font-bricolage text-violet mt-1">{data?.notifications?.length || 0}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-violet/10 border border-violet/20 flex items-center justify-center text-violet">
            <Bell className="w-4 h-4" />
          </div>
        </GlassCard>
      </div>

      {/* Main Grid: My Licenses & Assigned Software */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active License Keys */}
        <GlassCard className="lg:col-span-2 flex flex-col gap-4 p-6">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan" />
              <h3 className="font-bricolage font-bold text-base text-white">My Active License Keys</h3>
            </div>
            <span className="text-xs text-muted font-mono">{data?.licenses?.length || 0} Total Keys</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted">Loading active license keys...</div>
          ) : !data?.licenses || data.licenses.length === 0 ? (
            <div className="text-center py-12 text-muted flex flex-col items-center justify-center gap-2">
              <Key className="w-8 h-8 text-muted/40" />
              <span>No license keys assigned to your account yet.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.licenses.map((lic) => (
                <div key={lic.id} className="p-4 bg-surface2/30 border border-border rounded-sm flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-xs">{lic.product?.name || "Software Product"}</span>
                    <Badge variant={lic.status === "ACTIVE" ? "active" : "danger"}>{lic.status}</Badge>
                  </div>

                  <div className="flex items-center justify-between font-mono bg-surface2/60 border border-border p-2 rounded-sm text-cyan font-bold text-xs">
                    <span>{lic.licenseKey}</span>
                    <button
                      onClick={() => handleCopyKey(lic.licenseKey)}
                      className="p-1 hover:text-white transition-all text-muted"
                      title="Copy License Key"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-muted">
                    <span>Type: {lic.type}</span>
                    <span>Device Activation: <strong className="text-cyan">{lic.devices?.length || 0}</strong> / {lic.deviceLimit}</span>
                    <span>Expires: {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : "Lifetime"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* System Announcements */}
        <GlassCard className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Bell className="w-4 h-4 text-violet" />
            <h3 className="font-bricolage font-bold text-base text-white">System Announcements</h3>
          </div>

          {!data?.notifications || data.notifications.length === 0 ? (
            <div className="text-center py-12 text-muted">No new announcements.</div>
          ) : (
            <div className="flex flex-col gap-3 text-xs">
              {data.notifications.map((n) => (
                <div key={n.id} className="p-3 bg-surface2/30 border border-border rounded-sm flex flex-col gap-1">
                  <span className="font-bold text-white">{n.title}</span>
                  <p className="text-muted text-[11px] leading-relaxed">{n.message}</p>
                  <span className="text-[9px] text-muted/70 font-mono mt-1">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Assigned Products Cards */}
      <GlassCard className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Package className="w-4 h-4 text-green" />
          <h3 className="font-bricolage font-bold text-base text-white">My Assigned Software Products</h3>
        </div>

        {!data?.products || data.products.length === 0 ? (
          <div className="text-center py-12 text-muted">No products assigned yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {data.products.map((p) => (
              <div key={p.id} className="p-4 bg-surface2/30 border border-border rounded-sm flex flex-col justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center font-bold text-cyan font-bricolage text-sm">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-xs">{p.name}</span>
                    <span className="text-[10px] text-muted font-mono">v{p.version}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
                  {p.documentationUrl && (
                    <a
                      href={p.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-cyan font-bold text-[10px] flex items-center gap-1"
                    >
                      <span>Docs</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {p.downloadUrl && (
                    <a
                      href={p.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-sm bg-cyan text-black font-bold text-[10px] flex items-center gap-1 hover:bg-cyan/90 transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
