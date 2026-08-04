import { GlassCard } from "@/components/glass-card";
import { 
  Users, 
  Key, 
  Download, 
  DollarSign, 
  Activity, 
  Layers,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    { title: "Total Users", value: "1,245,800", change: "+12.4%", label: "vs last month", icon: Users, accent: "cyan" },
    { title: "Active Licenses", value: "76,402", change: "+8.2%", label: "vs last week", icon: Key, accent: "violet" },
    { title: "Global Downloads", value: "5,412,890", change: "+15.1%", label: "accumulated", icon: Download, accent: "gold" },
    { title: "Monthly Net Revenue", value: "$184,500.00", change: "+24.3%", label: "net earnings", icon: DollarSign, accent: "green" },
  ];

  const recentActivations = [
    { key: "BL-JP-A1B2-C3D4-E5F6", user: "alex@devmail.net", product: "JoyPanda Downloader", os: "Windows 11", activeAt: "2 mins ago" },
    { key: "BL-CP-F7G8-H9I0-J1K2", user: "sara.k@creative.co", product: "ClipPanda AI Clipper", os: "macOS 14.2", activeAt: "14 mins ago" },
    { key: "BL-PP-L3M4-N5O6-P7Q8", user: "team@datascrape.io", product: "ProxyPanda Network Tunnel", os: "Linux Ubuntu", activeAt: "45 mins ago" },
    { key: "BL-GP-R9S0-T1U2-V3W4", user: "vloggers@studio.tv", product: "GlitchPanda Video Automation", os: "Windows 10", activeAt: "1 hr ago" },
  ];

  const recentOrders = [
    { id: "ORD-94827", user: "dev.ops@cloudforce.com", amount: "$299.00", status: "COMPLETED", date: "Today, 14:24" },
    { id: "ORD-94826", user: "markus@videobuild.de", amount: "$49.00", status: "COMPLETED", date: "Today, 12:10" },
    { id: "ORD-94825", user: "monetize@fbpages.pk", amount: "$99.00", status: "REFUNDED", date: "Yesterday, 18:40" },
    { id: "ORD-94824", user: "test.user@dummy.com", amount: "$0.00", status: "FAILED", date: "2 days ago, 09:15" },
  ];

  const activeReleases = [
    { name: "JoyPanda Downloader", version: "v2.4.1", status: "LIVE", type: "Desktop Application" },
    { name: "ClipPanda AI Clipper", version: "v1.2.0-beta", status: "BETA", type: "AI Web Utility" },
    { name: "ProxyPanda Network Tunnel", version: "v3.1.0", status: "LIVE", type: "System Tool" },
    { name: "GlitchPanda Video Automation", version: "v1.8.5", status: "LIVE", type: "Automation Script" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h2 className="font-bricolage font-bold text-2xl tracking-tight">Executive Dashboard</h2>
        <p className="text-xs text-muted">Real-time control center metrics of BornaLabs systems.</p>
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
                <span className="text-2xl font-bold font-bricolage">{stat.value}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold text-green">{stat.change}</span>
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
              <h3 className="font-bricolage font-bold text-sm">Telemetry Handshakes</h3>
              <p className="text-[10px] text-muted">Active client instances validation checkups.</p>
            </div>
            <span className="flex items-center gap-1.5 text-[9px] font-bold bg-green/10 border border-green/20 text-green px-2 py-0.5 rounded-sm uppercase">
              <Activity className="w-2.5 h-2.5" />
              Live Stream
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {recentActivations.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-sm bg-surface2/30 border border-border text-[11px]">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold font-mono text-cyan">{item.key}</span>
                  <span className="text-muted">{item.user} • {item.product}</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-semibold text-foreground">{item.os}</span>
                  <span className="text-muted">{item.activeAt}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Active Product Release Summary */}
        <GlassCard className="flex flex-col gap-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bricolage font-bold text-sm">Active Releases</h3>
            <p className="text-[10px] text-muted">Active client version deployments status.</p>
          </div>

          <div className="flex flex-col gap-3">
            {activeReleases.map((release, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex flex-col">
                  <span className="font-bold text-[11px]">{release.name}</span>
                  <span className="text-[9px] text-muted">{release.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-cyan text-[10px]">{release.version}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm border ${
                    release.status === "LIVE" 
                      ? "bg-green/10 border-green/20 text-green" 
                      : "bg-gold/10 border-gold/20 text-gold"
                  }`}>
                    {release.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Third Grid - Transactions list */}
      <GlassCard className="flex flex-col gap-4">
        <div className="border-b border-border pb-3">
          <h3 className="font-bricolage font-bold text-sm">Recent Transactions</h3>
          <p className="text-[10px] text-muted">SaaS invoice generation and orders updates.</p>
        </div>

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
              {recentOrders.map((order, idx) => (
                <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                  <td className="py-3 font-mono font-bold">{order.id}</td>
                  <td className="py-3 text-muted">{order.user}</td>
                  <td className="py-3 font-bold">{order.amount}</td>
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
                  <td className="py-3 text-muted">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
