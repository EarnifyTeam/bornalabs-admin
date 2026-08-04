import { GlassCard } from "@/components/glass-card";
import { 
  Users, 
  Key, 
  Download, 
  DollarSign, 
  Activity, 
  RefreshCw,
  AlertCircle
} from "lucide-react";
import prisma from "@/lib/prisma";

// Prevent Vercel caching to ensure metrics refresh on reload
export const revalidate = 0;

export default async function Dashboard() {
  // Query actual live metrics from Supabase
  const totalUsers = await prisma.user.count();
  const activeLicenses = await prisma.license.count({
    where: { status: "ACTIVE" }
  });
  const totalDownloads = await prisma.downloads.count();
  
  const ordersAggregate = await prisma.order.aggregate({
    _sum: {
      totalAmount: true
    },
    where: {
      status: "COMPLETED"
    }
  });
  const netRevenue = Number(ordersAggregate._sum.totalAmount || 0);

  // Query actual live telemetry handshakes (registered devices logs)
  const devices = await prisma.device.findMany({
    include: {
      license: {
        include: {
          product: true,
          user: true
        }
      }
    },
    orderBy: {
      lastActiveAt: "desc"
    },
    take: 4
  });

  // Query actual live orders list
  const orders = await prisma.order.findMany({
    include: {
      user: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 4
  });

  // Query actual live releases
  const releases = await prisma.release.findMany({
    include: {
      product: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 4
  });

  const stats = [
    { title: "Total Users", value: totalUsers.toLocaleString(), change: "+100%", label: "actual database", icon: Users, accent: "cyan" },
    { title: "Active Licenses", value: activeLicenses.toLocaleString(), change: "0%", label: "actual database", icon: Key, accent: "violet" },
    { title: "Global Downloads", value: totalDownloads.toLocaleString(), change: "0%", label: "actual database", icon: Download, accent: "gold" },
    { title: "Monthly Net Revenue", value: `$${netRevenue.toFixed(2)}`, change: "0%", label: "actual database", icon: DollarSign, accent: "green" },
  ];

  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">Executive Dashboard</h2>
          <p className="text-xs text-muted">Real-time control center metrics of BornaLabs systems.</p>
        </div>
        <span className="text-[10px] bg-green/10 border border-green/20 text-green font-bold px-3 py-1.5 rounded-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
          Database Connected
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
        
        {/* Recent License Activations */}
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

          <div className="flex flex-col gap-2">
            {devices.length === 0 ? (
              <div className="text-center py-8 text-muted flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-muted/60" />
                No client telemetry handshakes recorded yet.
              </div>
            ) : (
              devices.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-sm bg-surface2/30 border border-border text-[11px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold font-mono text-cyan">{item.hwFingerprint}</span>
                    <span className="text-muted">
                      {item.license.user.email} • {item.license.product.name}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-semibold text-foreground">{item.os}</span>
                    <span className="text-muted">{new Date(item.lastActiveAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Active Product Release Summary */}
        <GlassCard className="flex flex-col gap-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bricolage font-bold text-sm text-white">Active Releases</h3>
            <p className="text-[10px] text-muted">Active client version deployments status.</p>
          </div>

          <div className="flex flex-col gap-3">
            {releases.length === 0 ? (
              <div className="text-center py-8 text-muted flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-muted/60" />
                No active releases uploaded yet.
              </div>
            ) : (
              releases.map((release, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-[11px] text-white">{release.product.name}</span>
                    <span className="text-[9px] text-muted">{release.product.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan text-[10px]">{release.version}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm border ${
                      release.isForceUpdate 
                        ? "bg-red/10 border-red/20 text-red" 
                        : "bg-green/10 border-green/20 text-green"
                    }`}>
                      {release.isForceUpdate ? "FORCE" : "LIVE"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Third Grid - Transactions list */}
      <GlassCard className="flex flex-col gap-4">
        <div className="border-b border-border pb-3">
          <h3 className="font-bricolage font-bold text-sm text-white">Recent Transactions</h3>
          <p className="text-[10px] text-muted">SaaS invoice generation and orders updates.</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-muted/60" />
            No purchase transactions logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5">Order ID</th>
                  <th className="py-2.5">Customer Email</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                    <td className="py-3 font-mono font-bold text-white">{order.id}</td>
                    <td className="py-3 text-muted">{order.user.email}</td>
                    <td className="py-3 font-bold text-white">${Number(order.totalAmount).toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${
                        order.status === "COMPLETED" 
                          ? "bg-green/10 border-green/20 text-green" 
                          : order.status === "REFUNDED" 
                          ? "bg-cyan/10 border-cyan/20 text-cyan" 
                          : "bg-red/10 border-red/20 text-red"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-muted">{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
