"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";
import { 
  Users, 
  Search, 
  Plus, 
  ShieldAlert, 
  UserMinus, 
  Check, 
  RefreshCw, 
  Award,
  Edit2,
  Trash2,
  AlertCircle
} from "lucide-react";
import { UserModal, type UserFormData } from "@/components/users/user-modal";

interface Profile {
  fullName: string;
  phone?: string | null;
}

interface UserData {
  id: string;
  email: string;
  role: string;
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  premiumStatus: boolean;
  notes: string | null;
  profile: Profile | null;
  _count?: {
    licenses: number;
    orders: number;
  };
}

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/api/users";
      if (roleFilter !== "All") {
        url += `?role=${roleFilter.toUpperCase().replace(" ", "_")}`;
      }
      const response = await fetch(url);
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
  }, [roleFilter]);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: UserData) => {
    setEditingUser({
      id: u.id,
      fullName: u.profile?.fullName || "BornaLabs User",
      email: u.email,
      role: u.role,
      status: u.status,
      premiumStatus: u.premiumStatus,
      phone: u.profile?.phone || "",
      notes: u.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (formData: UserFormData) => {
    setModalLoading(true);
    try {
      const isEditing = !!formData.id;
      const url = isEditing ? `/api/users/${formData.id}` : "/api/users";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`User account ${isEditing ? "updated" : "created"} successfully!`);
        setIsModalOpen(false);
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to save user account.");
      }
    } catch (err) {
      toast.error("Error saving user data.");
    } finally {
      setModalLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        toast.success(`User account status updated to ${status}.`);
        fetchUsers();
      } else {
        toast.error("Failed to update user status.");
      }
    } catch (err) {
      toast.error("Error sending status update request.");
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
        toast.success(`User premium tier status ${!currentPremium ? "assigned" : "revoked"}.`);
        fetchUsers();
      } else {
        toast.error("Failed to toggle premium status.");
      }
    } catch (err) {
      toast.error("Error sending premium update request.");
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user account "${email}"?`)) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`User account "${email}" deleted.`);
        fetchUsers();
      } else {
        toast.error("Failed to delete user account.");
      }
    } catch (err) {
      toast.error("Error deleting user.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const fullName = u.profile?.fullName || "BornaLabs User";
    const matchesSearch = 
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.notes && u.notes.toLowerCase().includes(search.toLowerCase()));

    return matchesSearch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE": return "active";
      case "SUSPENDED": return "warning";
      case "BANNED": return "danger";
      default: return "neutral";
    }
  };

  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">User Operations</h2>
          <p className="text-xs text-muted">Create, suspend, ban users, assign premium statuses, and adjust role access logs in Supabase DB.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan" : ""}`} />}
            onClick={fetchUsers}
          >
            Reload List
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleOpenCreateModal}
          >
            New User
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard hoverable={false} className="py-4 px-6 flex items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search users by name, email address, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-muted" />}
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
          <div className="text-center py-12 text-muted">Loading user accounts database...</div>
        ) : error ? (
          <div className="text-center py-12 text-red font-semibold">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted flex flex-col items-center justify-center gap-2">
            <Users className="w-8 h-8 text-muted/50" />
            <span>No user accounts matching current filter criteria.</span>
          </div>
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
                        <Badge variant={getStatusVariant(u.status)}>{u.status}</Badge>
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
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1 hover:text-cyan transition-all"
                            title="Edit User Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="p-1 hover:text-red transition-all"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        initialData={editingUser}
        loading={modalLoading}
      />
    </div>
  );
}
