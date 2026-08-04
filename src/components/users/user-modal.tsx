"use client";

import React, { useEffect, useState } from "react";
import { X, User, Shield, Award } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface UserFormData {
  id?: string;
  fullName: string;
  email: string;
  password?: string;
  role: string;
  status: string;
  premiumStatus: boolean;
  phone: string;
  notes: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void>;
  initialData?: UserFormData | null;
  loading?: boolean;
}

export function UserModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
}: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    email: "",
    password: "",
    role: "SUPPORT",
    status: "ACTIVE",
    premiumStatus: false,
    phone: "",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: "",
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "SUPPORT",
        status: "ACTIVE",
        premiumStatus: false,
        phone: "",
        notes: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <GlassCard hoverable={false} className="w-full max-w-lg flex flex-col gap-6 p-6 relative border-cyan/20">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bricolage font-bold text-base text-white">
                {initialData ? "Edit User Account" : "New User Registration"}
              </h3>
              <p className="text-[10px] text-muted">Configure account role and administrative status in Supabase DB.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-white hover:bg-surface/40 rounded-sm transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Suraj Kumar"
            />

            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@bornalabs.com"
              disabled={!!initialData}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={initialData ? "New Password (Leave blank to keep)" : "Account Password"}
              type="password"
              required={!initialData}
              value={formData.password || ""}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />

            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Access Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="bg-surface2/40 border border-border rounded-sm py-2 px-2 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="SUPPORT">Support</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Account State</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="bg-surface2/40 border border-border rounded-sm py-2 px-2 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="premiumStatus"
              checked={formData.premiumStatus}
              onChange={(e) => setFormData({ ...formData, premiumStatus: e.target.checked })}
              className="accent-cyan w-4 h-4 rounded-sm border-border cursor-pointer"
            />
            <label htmlFor="premiumStatus" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-gold" />
              Assign Premium Tier Status
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-bold text-[10px] uppercase">Administrative Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Internal admin notes regarding account access or history..."
              className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant="primary">
              {loading ? "Saving User..." : initialData ? "Update Account" : "Create User Account"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
