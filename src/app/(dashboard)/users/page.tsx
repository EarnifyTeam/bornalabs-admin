"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  Ban, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Key,
  Crown
} from "lucide-react";
import { UserModal, type UserFormData } from "@/components/users/user-modal";
import { UserProfileDrawer } from "@/components/users/user-profile-drawer";

interface UserRecord {
  id: string;
  email: string;
  role: string;
  status: string;
  premiumStatus: boolean;
  notes?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  profile?: {
    fullName: string;
    phone?: string | null;
    avatarUrl?: string | null;
    country?: string | null;
    timezone?: string | null;
  };
  _count?: {
    licenses: number;
    downloads: number;
  };
}

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal & Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  const [selectedDrawerUserId, setSelectedDrawerUserId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams({
        search,
        role: selectedRole,
        status: selectedStatus,
        page: page.toString(),
        limit: "8",
      });

      const res = await fetch(`/api/users?${queryParams.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setUsers(data.users || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      } else {
        setError(data.message || "Failed to load user accounts.");
      }
    } catch (err) {
      setError("Error connecting to Users API endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, selectedRole, selectedStatus, page]);

  const handleCreateNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserRecord) => {
    setEditingUser({
      id: user.id,
      email: user.email,
      fullName: user.profile?.fullName || "",
      role: user.role,
      status: user.status,
      phone: user.profile?.phone || "",
      country: user.profile?.country || "United States",
      timezone: user.profile?.timezone || "UTC",
      notes: user.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (formData: UserFormData) => {
    setModalLoading(true);
    try {
      const isEdit = !!formData.id;
      const url = isEdit ? `/api/users/${formData.id}` : "/api/users";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`User account ${isEdit ? "updated" : "registered"} successfully!`);
        setIsModalOpen(false);
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to save user account.");
      }
    } catch (err) {
      toast.error("Error saving user account.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string, email: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Account ${email} set to ${newStatus}.`);
        fetchUsers();
      } else {
        toast.error("Failed to update user status.");
      }
    } catch (err) {
      toast.error("Error updating user status.");
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to permanently delete user account "${email}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`User account ${email} deleted.`);
        fetchUsers();
      } else {
        toast.error("Failed to delete user account.");
      }
    } catch (err) {
      toast.error("Error deleting user account.");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge variant="active">SUPER ADMIN</Badge>;
      case "ADMIN":
        return <Badge variant="info">ADMIN</Badge>;
      case "MANAGER":
        return <Badge variant="warning">MANAGER</Badge>;
      case "SUPPORT":
        return <Badge variant="info">SUPPORT</Badge>;
      case "CUSTOMER":
        return <Badge variant="neutral">CUSTOMER</Badge>;
      default:
        return <Badge variant="neutral">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="active">ACTIVE</Badge>;
      case "SUSPENDED":
        return <Badge variant="warning">SUSPENDED</Badge>;
      case "BANNED":
        return <Badge variant="danger">BANNED</Badge>;
      case "INACTIVE":
        return <Badge variant="neutral">INACTIVE</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">User & Customer Operations</h2>
          <p className="text-xs text-muted">Manage customer accounts, roles, access statuses, and license allocations in Supabase DB.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan" : ""}`} />}
            onClick={fetchUsers}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={handleCreateNew}
          >
            Register User
          </Button>
        </div>
      </div>

      {/* Filter Bar & Role Tabs */}
      <GlassCard className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          {/* Role Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {["ALL", "SUPER_ADMIN", "ADMIN", "MANAGER", "SUPPORT", "CUSTOMER"].map((roleTab) => (
              <button
                key={roleTab}
                onClick={() => { setSelectedRole(roleTab); setPage(1); }}
                className={`px-3 py-1.5 rounded-sm font-bold text-xs transition-all ${
                  selectedRole === roleTab
                    ? "bg-surface border border-cyan/40 text-cyan shadow-sm"
                    : "bg-surface2/20 text-muted hover:text-white"
                }`}
              >
                {roleTab.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full md:w-64 relative">
            <Input
              placeholder="Search user, email or phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="w-3.5 h-3.5 text-muted" />}
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-4 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <label className="text-muted font-bold text-[10px] uppercase shrink-0">Account Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="bg-surface2/40 border border-border rounded-sm py-1.5 px-3 text-foreground text-xs focus:outline-none w-48"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Users Data Table */}
      <GlassCard className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-16 text-muted">Loading user accounts...</div>
        ) : error ? (
          <div className="text-center py-16 text-red font-semibold">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-muted flex flex-col items-center justify-center gap-2">
            <Users className="w-8 h-8 text-muted/50" />
            <span>No user accounts found matching query.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Country</th>
                  <th className="py-3">Assigned Licenses</th>
                  <th className="py-3">Registered On</th>
                  <th className="py-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                    <td className="py-4 px-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan to-violet flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {u.profile?.fullName?.slice(0, 2)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex flex-col">
                          <span>{u.profile?.fullName || "User Account"}</span>
                          <span className="text-[10px] text-muted font-mono font-normal">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">{getRoleBadge(u.role)}</td>
                    <td className="py-4">{getStatusBadge(u.status)}</td>
                    <td className="py-4 text-muted text-[11px]">{u.profile?.country || "Global"}</td>
                    <td className="py-4 font-mono text-cyan font-bold text-[11px]">
                      {u._count?.licenses || 0} Key(s)
                    </td>
                    <td className="py-4 text-muted text-[10px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => setSelectedDrawerUserId(u.id)}
                          className="p-1 hover:text-cyan transition-all text-muted"
                          title="View Profile Drawer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(u)}
                          className="p-1 hover:text-cyan transition-all text-muted"
                          title="Edit User Account"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Status Toggles */}
                        {u.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleUpdateStatus(u.id, "SUSPENDED", u.email)}
                            className="p-1 hover:text-gold transition-all text-muted"
                            title="Suspend User Access"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(u.id, "ACTIVE", u.email)}
                            className="p-1 hover:text-green transition-all text-muted"
                            title="Activate User Access"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-green" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="p-1 hover:text-red transition-all text-muted"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-4 px-2">
            <span className="text-muted text-[10px]">
              Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span> ({totalCount} total users)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                icon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                icon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            </div>
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

      {/* User Profile Drawer */}
      <UserProfileDrawer
        userId={selectedDrawerUserId}
        isOpen={!!selectedDrawerUserId}
        onClose={() => setSelectedDrawerUserId(null)}
      />
    </div>
  );
}
