import { GlassCard } from "@/components/glass-card";
import { 
  Users, 
  Search, 
  Plus, 
  ShieldAlert, 
  UserMinus, 
  Key, 
  Check, 
  X,
  Lock,
  Edit2
} from "lucide-react";

export default function UsersPage() {
  const users = [
    { id: "u1", name: "Suraj Kumar", email: "suraj@bornalabs.com", role: "SUPER_ADMIN", status: "ACTIVE", premium: true, notes: "Founder & Lead Architect." },
    { id: "u2", name: "Abdullah Zia", email: "abdullah@bornalabs.com", role: "ADMIN", status: "ACTIVE", premium: true, notes: "Marketing director and tools planner." },
    { id: "u3", name: "Sarah Connor", email: "support.team@creative.net", role: "SUPPORT", status: "ACTIVE", premium: false, notes: "Handles daily client license resets." },
    { id: "u4", name: "Abuse Tester", email: "leaker@hackermail.com", role: "SUPPORT", status: "BANNED", premium: false, notes: "Banned for multiple parallel HW fingerpint leaks." },
    { id: "u5", name: "John Doe", email: "john@enterprise.io", role: "MANAGER", status: "SUSPENDED", premium: true, notes: "Account suspended pending transaction check." },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight">User Operations</h2>
          <p className="text-xs text-muted">Create, suspend, ban users, assign premium statuses, and adjust role access logs.</p>
        </div>
        <button className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-tr from-cyan to-violet px-4 py-2.5 rounded-sm shadow-md hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" />
          Create System User
        </button>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard hoverable={false} className="py-4 px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 border border-border bg-surface2/25 px-3 py-1.5 rounded-sm w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-muted" />
          <input 
            type="text" 
            placeholder="Search users by name, email address, notes..." 
            className="bg-transparent text-xs text-foreground focus:outline-none w-full placeholder:text-muted/60"
          />
        </div>
        <div className="flex gap-2">
          {["All Roles", "Super Admin", "Admin", "Manager", "Support"].map((roleFilter, idx) => (
            <button 
              key={idx} 
              className={`text-[10px] font-bold px-3 py-1.5 rounded-sm border transition-all ${
                idx === 0 
                  ? "bg-surface border-border-active text-cyan" 
                  : "bg-surface2/20 border-border text-muted hover:text-foreground hover:bg-surface/30"
              }`}
            >
              {roleFilter}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Users database list table */}
      <GlassCard className="flex flex-col gap-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                <th className="py-3">Profile Name</th>
                <th className="py-3">Email Address</th>
                <th className="py-3">Assigned Role</th>
                <th className="py-3">Premium Status</th>
                <th className="py-3">Account State</th>
                <th className="py-3">Administrative Notes</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                  <td className="py-4 font-bold text-foreground">{u.name}</td>
                  <td className="py-4 text-muted font-mono">{u.email}</td>
                  <td className="py-4 font-semibold text-violet text-[10px]">{u.role}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-sm border ${
                      u.premium 
                        ? "bg-green/10 border-green/20 text-green" 
                        : "bg-muted/5 border-border text-muted"
                    }`}>
                      {u.premium ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                      {u.premium ? "Premium Active" : "Free Tier"}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm border ${
                      u.status === "ACTIVE" 
                        ? "bg-green/10 border-green/20 text-green" 
                        : u.status === "SUSPENDED" 
                        ? "bg-gold/10 border-gold/20 text-gold" 
                        : "bg-red/10 border-red/20 text-red"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4 text-muted text-[11px] max-w-xs truncate">{u.notes}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2 text-muted">
                      <button className="p-1 hover:text-foreground transition-all" title="Edit Profile Details">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 hover:text-foreground transition-all" title="Reset/Change Password">
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 hover:text-gold transition-all" title="Suspend User">
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 hover:text-red transition-all" title="Ban Account">
                        <UserMinus className="w-3.5 h-3.5" />
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
