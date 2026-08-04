import { GlassCard } from "@/components/glass-card";
import { 
  Key, 
  Plus, 
  Search, 
  RefreshCw, 
  Ban, 
  Trash2, 
  Eye, 
  CheckCircle,
  AlertTriangle,
  Monitor
} from "lucide-react";

export default function LicensesPage() {
  const licenseStats = [
    { title: "Total Licenses", value: "84,520", subtitle: "Active & Trial keys" },
    { title: "Devices Connected", value: "112,890", subtitle: "Active system nodes" },
    { title: "Key Suspended", value: "312", subtitle: "Blacklisted leak attempts" },
    { title: "Uptime Health", value: "99.99%", subtitle: "Telemetry validation node" },
  ];

  const licenses = [
    { id: "l1", key: "BL-JP-X7Y8-M2K4-N9P5", user: "dev@videoproduction.de", product: "JoyPanda", type: "Yearly", devices: "2 / 5", status: "ACTIVE", lastActive: "3 mins ago" },
    { id: "l2", key: "BL-CP-R1A4-F8T2-G6H9", user: "mark.s@studio.net", product: "ClipPanda", type: "Lifetime", devices: "1 / 1", status: "ACTIVE", lastActive: "12 mins ago" },
    { id: "l3", key: "BL-PP-Q9W1-E5R7-T2Y4", user: "scrape.ninja@core.io", product: "ProxyPanda", type: "Monthly", devices: "5 / 5", status: "ACTIVE", lastActive: "44 mins ago" },
    { id: "l4", key: "BL-GP-U8I3-O2P4-A6S1", user: "leak.abuser@hacker.net", product: "GlitchPanda", type: "Trial", devices: "0 / 1", status: "SUSPENDED", lastActive: "2 days ago" },
    { id: "l5", key: "BL-JP-D4F9-G8H1-J3K6", user: "client.expired@dummy.org", product: "JoyPanda", type: "Monthly", devices: "2 / 2", status: "EXPIRED", lastActive: "1 week ago" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight">License Manager</h2>
          <p className="text-xs text-muted">Generate, renew, suspend, and monitor active client device hardware signatures.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 text-xs font-bold text-muted border border-border bg-surface2/10 px-4 py-2.5 rounded-sm hover:text-foreground hover:bg-surface/30 transition-all">
            Import CSV
          </button>
          <button className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-tr from-cyan to-violet px-4 py-2.5 rounded-sm shadow-md hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" />
            Generate License
          </button>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {licenseStats.map((stat, i) => (
          <GlassCard key={i} hoverable={false} className="py-4 px-6 flex flex-col gap-1.5">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">{stat.title}</span>
            <span className="text-xl font-bold font-bricolage">{stat.value}</span>
            <span className="text-[9px] text-muted">{stat.subtitle}</span>
          </GlassCard>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <GlassCard hoverable={false} className="py-4 px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 border border-border bg-surface2/25 px-3 py-1.5 rounded-sm w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-muted" />
          <input 
            type="text" 
            placeholder="Search licenses by key, owner email, HW ID..." 
            className="bg-transparent text-xs text-foreground focus:outline-none w-full placeholder:text-muted/60"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Suspended", "Expired"].map((statFilter, idx) => (
            <button 
              key={idx} 
              className={`text-[10px] font-bold px-3 py-1.5 rounded-sm border transition-all ${
                idx === 0 
                  ? "bg-surface border-border-active text-cyan" 
                  : "bg-surface2/20 border-border text-muted hover:text-foreground hover:bg-surface/30"
              }`}
            >
              {statFilter}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* License table */}
      <GlassCard className="flex flex-col gap-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                <th className="py-3">License Key</th>
                <th className="py-3">Owner Email</th>
                <th className="py-3">Associated Product</th>
                <th className="py-3">Plan Details</th>
                <th className="py-3">Devices Bound</th>
                <th className="py-3">Last Active Call</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((l, idx) => (
                <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                  <td className="py-4 font-mono font-bold text-cyan text-[11px]">{l.key}</td>
                  <td className="py-4 text-muted">{l.user}</td>
                  <td className="py-4 text-foreground font-semibold">{l.product}</td>
                  <td className="py-4 text-muted">{l.type}</td>
                  <td className="py-4 font-mono font-bold text-[11px] flex items-center gap-1.5 mt-1.5">
                    <Monitor className="w-3.5 h-3.5 text-muted" />
                    {l.devices}
                  </td>
                  <td className="py-4 text-muted">{l.lastActive}</td>
                  <td className="py-4">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm border ${
                      l.status === "ACTIVE" 
                        ? "bg-green/10 border-green/20 text-green" 
                        : l.status === "SUSPENDED" 
                        ? "bg-red/10 border-red/20 text-red" 
                        : "bg-muted/10 border-border text-muted"
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2 text-muted">
                      <button className="p-1 hover:text-foreground transition-all" title="Reset devices (flush logs)">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 hover:text-red transition-all" title="Suspend/Revoke Key">
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 hover:text-red transition-all" title="Hard Delete Record">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
