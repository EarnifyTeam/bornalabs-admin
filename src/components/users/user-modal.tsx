"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, User, Mail, Phone, Globe, Shield, Clock } from "lucide-react";

export interface UserFormData {
  id?: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  phone: string;
  country: string;
  timezone: string;
  notes: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void>;
  initialData?: UserFormData | null;
  loading?: boolean;
}

const defaultFormData: UserFormData = {
  email: "",
  fullName: "",
  role: "CUSTOMER",
  status: "ACTIVE",
  phone: "",
  country: "United States",
  timezone: "UTC",
  notes: "",
};

export function UserModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
}: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>(defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <GlassCard hoverable={false} className="w-full max-w-lg flex flex-col gap-6 p-6 my-8 border-cyan/20">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-border pb-4">
          <div>
            <h2 className="font-bricolage font-bold text-lg text-white">
              {initialData ? "Edit User Account" : "Register Customer Account"}
            </h2>
            <p className="text-xs text-muted">Create or modify customer profile and role access levels in Supabase DB.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-sm text-muted hover:text-foreground hover:bg-surface2/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <Input
            label="Full Name *"
            required
            value={formData.fullName}
            onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
            placeholder="John Doe"
            leftIcon={<User className="w-4 h-4 text-muted" />}
          />

          <Input
            label="Email Address *"
            type="email"
            required
            disabled={!!initialData}
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="john@example.com"
            leftIcon={<Mail className="w-4 h-4 text-muted" />}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Access Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              >
                <option value="CUSTOMER">Customer User</option>
                <option value="SUPPORT">Support Officer</option>
                <option value="MANAGER">Product Manager</option>
                <option value="ADMIN">System Admin</option>
                <option value="SUPER_ADMIN">Super Administrator</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Account Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              >
                <option value="ACTIVE">Active Account</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended Access</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 (555) 000-0000"
              leftIcon={<Phone className="w-4 h-4 text-muted" />}
            />

            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
              placeholder="United States"
              leftIcon={<Globe className="w-4 h-4 text-muted" />}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-bold text-[10px] uppercase">Admin Internal Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Customer support tier notes..."
              className="bg-surface2/40 border border-border rounded-sm p-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-border pt-4 mt-2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving Account..." : initialData ? "Update User" : "Register User"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
