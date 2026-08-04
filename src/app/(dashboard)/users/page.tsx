"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { 
  Users, 
  Search, 
  Plus, 
  ShieldAlert, 
  UserMinus, 
  Check, 
  X,
  Lock,
  Edit2,
  RefreshCw,
  Award
} from "lucide-react";

interface Profile {
  fullName: string;
}

interface UserData {
  id: string;
  email: string;
  role: string;
  status: string;
  premiumStatus: boolean;
  notes: string | null;
  profile: Profile | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.error || "Failed to load users list.");
      }
    } catch (err) {
      setError("Network error loading users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        // Refetch users to update view
        fetchUsers();
      } else {
        alert("Failed to update user status.");
      }
    } catch (err) {
      alert("Error sending update request.");
    }
  };

  const togglePremium = async (userId: string, currentPremium: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ premiumStatus: !currentPremium }),
      });
      if (response.ok) {
        fetchUsers();
      } else {
        alert("Failed to toggle premium status.");
      }
    } catch (err) {
      alert("Error sending update request.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const fullName = u.profile?.fullName || "BornaLabs User";
    const matchesSearch = 
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.notes && u.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === "All" || u.role === roleFilter.toUpperCase().replace(" ", "_");

    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">User Operations</h2>
          <p className="text-xs text-muted">Create, suspend, ban users, assign premium statuses, and adjust role access logs.</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="flex items-center gap-2 text-xs font-bold text-white bg-surface border border-border px-4 py-2.5 rounded-sm shadow-md hover:bg-surface/60 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan" : ""}`} />
          Reload User List
        </button>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard hoverable={false} className="py-4 px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 border border-border bg-surface2/25 px-3 py-1.5 rounded-sm w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-muted" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email address, notes..." 
            className="bg-transparent text-xs text-foreground focus:outline-none w-full placeholder:text-muted/60"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Super Admin", "Admin", "Manager", "Support"].map((role, idx) => (
            <button 
              key={idx} 
              onClick={() => setRoleFilter(role)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-sm border transition-all ${
                roleFilter === role 
                  ? "bg-surface border-border-active text-cyan" 
                  : "bg-surface2/20 border-border text-muted hover:text-foreground hover:bg-surface/30"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Users list table */}
      <GlassCard className="flex flex-col gap-4">
        {loading && users.length === 0 ? (
          <div className="text-center py-8 text-muted">Loading user accounts...</div>
        ) : error ? (
          <div className="text-center py-8 text-red font-semibold">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted">No users matching current filters found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Profile Name</th>
                  <th className="py-3">Email Address</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Premium Status</th>
                  <th className="py-3">Account State</th>
                  <th className="py-3">Administrative Notes</th>
                  <th className="py-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => {
                  const fullName = u.profile?.fullName || "BornaLabs User";
                  return (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                      <td className="py-4 px-4 font-bold text-foreground">{fullName}</td>
                      <td className="py-4 text-muted font-mono">{u.email}</td>
                      <td className="py-4 font-semibold text-violet text-[10px]">{u.role}</td>
                      <td className="py-4">
                        <button
                          onClick={() => togglePremium(u.id, u.premiumStatus)}
                          className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-sm border hover:scale-105 transition-all ${
                            u.premiumStatus 
                              ? "bg-green/10 border-green/20 text-green" 
                              : "bg-muted/5 border-border text-muted hover:border-cyan hover:text-cyan"
                          }`}
                          title="Toggle Premium Tier"
                        >
                          {u.premiumStatus ? <Check className="w-2.5 h-2.5" /> : <Award className="w-2.5 h-2.5" />}
                          {u.premiumStatus ? "Premium Active" : "Assign Premium"}
                        </button>
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
                      <td className="py-4 text-muted text-[11px] max-w-xs truncate">{u.notes || "No notes saved."}</td>
                      <td className="py-4 text-right pr-4">
                        <div className="flex justify-end gap-2 text-muted">
                          {u.status !== "ACTIVE" && (
                            <button 
                              onClick={() => updateUserStatus(u.id, "ACTIVE")}
                              className="px-2 py-0.5 bg-green/10 hover:bg-green/20 text-green font-bold text-[9px] border border-green/20 rounded-sm"
                              title="Reactivate Account"
                            >
                              Activate
                            </button>
                          )}
                          {u.status === "ACTIVE" && (
                            <>
                              <button 
                                onClick={() => updateUserStatus(u.id, "SUSPENDED")}
                                className="p-1 hover:text-gold transition-all" 
                                title="Suspend User Account"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => updateUserStatus(u.id, "BANNED")}
                                className="p-1 hover:text-red transition-all" 
                                title="Ban Account"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
