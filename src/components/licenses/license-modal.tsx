"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Sparkles, Key, User, Calendar, Smartphone, FileText } from "lucide-react";

export interface LicenseFormData {
  id?: string;
  productId: string;
  userId?: string;
  userEmail: string;
  type: string;
  customLicenseKey: string;
  deviceLimit: string;
  expiryDays: string;
  status: string;
  notes: string;
}

interface ProductItem {
  id: string;
  name: string;
  category?: string;
}

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LicenseFormData) => Promise<void>;
  products: ProductItem[];
  initialData?: LicenseFormData | null;
  loading?: boolean;
}

const defaultFormData: LicenseFormData = {
  productId: "",
  userEmail: "",
  type: "TRIAL",
  customLicenseKey: "",
  deviceLimit: "1",
  expiryDays: "30",
  status: "ACTIVE",
  notes: "",
};

export function LicenseModal({
  isOpen,
  onClose,
  onSave,
  products,
  initialData,
  loading = false,
}: LicenseModalProps) {
  const [formData, setFormData] = useState<LicenseFormData>(defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        ...defaultFormData,
        productId: products[0]?.id || "",
      });
    }
  }, [initialData, products, isOpen]);

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
              {initialData ? "Edit License Specification" : "Generate Single License"}
            </h2>
            <p className="text-xs text-muted">Issue custom or auto-generated product license keys in Supabase DB.</p>
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
          {/* Target Product */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-bold text-[10px] uppercase">Target Product *</label>
            <select
              required
              value={formData.productId}
              onChange={(e) => setFormData((prev) => ({ ...prev, productId: e.target.value }))}
              className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
            >
              <option value="" disabled>Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category || "Software"})
                </option>
              ))}
            </select>
          </div>

          {/* Assigned User Email */}
          <Input
            label="Assigned User Email"
            type="email"
            value={formData.userEmail}
            onChange={(e) => setFormData((prev) => ({ ...prev, userEmail: e.target.value }))}
            placeholder="client@bornalabs.com"
            leftIcon={<User className="w-4 h-4 text-muted" />}
          />

          {/* Key Generation Mode */}
          {!initialData && (
            <Input
              label="Custom License Key (Leave empty to Auto-Generate BL-PREFIX-XXXX-XXXX-XXXX)"
              value={formData.customLicenseKey}
              onChange={(e) => setFormData((prev) => ({ ...prev, customLicenseKey: e.target.value }))}
              placeholder="e.g. BL-PX-CUSTOM-KEY-2026"
              leftIcon={<Key className="w-4 h-4 text-cyan" />}
            />
          )}

          {/* License Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">License Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              >
                <option value="TRIAL">Trial License</option>
                <option value="MONTHLY">Monthly Subscription</option>
                <option value="QUARTERLY">Quarterly License</option>
                <option value="YEARLY">Yearly Subscription</option>
                <option value="LIFETIME">Lifetime License</option>
                <option value="CUSTOM">Custom Enterprise</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="EXPIRED">Expired</option>
                <option value="REVOKED">Revoked</option>
              </select>
            </div>
          </div>

          {/* Device Limit & Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hardware Device Limit"
              type="number"
              min="1"
              max="50"
              value={formData.deviceLimit}
              onChange={(e) => setFormData((prev) => ({ ...prev, deviceLimit: e.target.value }))}
              leftIcon={<Smartphone className="w-4 h-4 text-muted" />}
            />

            <Input
              label="Validity Period (Days, 0 = Lifetime)"
              type="number"
              min="0"
              max="3650"
              value={formData.expiryDays}
              onChange={(e) => setFormData((prev) => ({ ...prev, expiryDays: e.target.value }))}
              leftIcon={<Calendar className="w-4 h-4 text-muted" />}
            />
          </div>

          {/* Admin Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-bold text-[10px] uppercase">Admin Internal Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Enterprise client allocation notes..."
              className="bg-surface2/40 border border-border rounded-sm p-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-border pt-4 mt-2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Issuing Key..." : initialData ? "Update License" : "Issue License"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
