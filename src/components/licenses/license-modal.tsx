"use client";

import React, { useEffect, useState } from "react";
import { X, Key, RefreshCw, Sparkles, Shield } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface LicenseFormData {
  id?: string;
  email: string;
  productId: string;
  type: string;
  prefix: string;
  deviceLimit: number;
  durationDays: string;
  customKey?: string;
  isAutoKey: boolean;
  status?: string;
  expiryDate?: string;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
}

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LicenseFormData) => Promise<void>;
  products: ProductItem[];
  initialData?: LicenseFormData | null;
  loading?: boolean;
}

export function LicenseModal({
  isOpen,
  onClose,
  onSave,
  products,
  initialData,
  loading = false,
}: LicenseModalProps) {
  const [formData, setFormData] = useState<LicenseFormData>({
    email: "customer@bornalabs.com",
    productId: "",
    type: "TRIAL",
    prefix: "PRO",
    deviceLimit: 1,
    durationDays: "30",
    customKey: "",
    isAutoKey: true,
    status: "ACTIVE",
  });

  useEffect(() => {
    if (products.length > 0 && !formData.productId) {
      setFormData((prev) => ({ ...prev, productId: products[0].id }));
    }
  }, [products]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        email: "customer@bornalabs.com",
        productId: products[0]?.id || "",
        type: "TRIAL",
        prefix: "PRO",
        deviceLimit: 1,
        durationDays: "30",
        customKey: "",
        isAutoKey: true,
        status: "ACTIVE",
      });
    }
  }, [initialData, isOpen, products]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const generatePreviewKey = () => {
    const p = (formData.prefix || "BL").toUpperCase();
    return `BL-${p}-XXXX-XXXX-XXXX-XXXX`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <GlassCard hoverable={false} className="w-full max-w-lg flex flex-col gap-6 p-6 relative border-violet/20">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet/10 border border-violet/20 flex items-center justify-center text-violet">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bricolage font-bold text-base text-white">
                {initialData ? "Edit License Configuration" : "Generate Single License Key"}
              </h3>
              <p className="text-[10px] text-muted">Manual & Auto license key provisioner (Supabase DB).</p>
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
          {!initialData && (
            <div className="flex items-center justify-between bg-surface2/30 p-2.5 border border-border rounded-sm">
              <span className="text-[11px] font-bold text-white">Key Generation Mode</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAutoKey: true })}
                  className={`px-3 py-1 text-[10px] font-bold rounded-sm border transition-all ${
                    formData.isAutoKey
                      ? "bg-violet/20 border-violet/40 text-violet"
                      : "bg-surface border-border text-muted"
                  }`}
                >
                  Auto Key
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAutoKey: false })}
                  className={`px-3 py-1 text-[10px] font-bold rounded-sm border transition-all ${
                    !formData.isAutoKey
                      ? "bg-cyan/20 border-cyan/40 text-cyan"
                      : "bg-surface border-border text-muted"
                  }`}
                >
                  Manual Key
                </button>
              </div>
            </div>
          )}

          {!formData.isAutoKey && !initialData ? (
            <Input
              label="Custom License Key"
              required
              value={formData.customKey || ""}
              onChange={(e) => setFormData({ ...formData, customKey: e.target.value })}
              placeholder="e.g. BL-PRO-ABCD-1234-EFGH-5678"
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Format Preview</label>
              <div className="bg-surface2/50 border border-border rounded-sm py-2 px-3 text-cyan font-mono font-bold text-xs tracking-wider">
                {initialData?.customKey || generatePreviewKey()}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Customer Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="customer@bornalabs.com"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Target Product</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="bg-surface2/40 border border-border rounded-sm py-2 px-2 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">License Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="bg-surface2/40 border border-border rounded-sm py-2 px-2 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              >
                <option value="FREE">Free Tier</option>
                <option value="TRIAL">Trial</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="LIFETIME">Lifetime</option>
              </select>
            </div>

            <Input
              label="Key Prefix"
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
              placeholder="PRO"
            />

            <Input
              label="Device Limit"
              type="number"
              min={1}
              max={100}
              required
              value={formData.deviceLimit}
              onChange={(e) => setFormData({ ...formData, deviceLimit: parseInt(e.target.value || "1") })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Validity Duration (Days)"
              type="number"
              value={formData.durationDays}
              onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
              placeholder="30 (leave blank for Lifetime)"
            />

            {initialData && (
              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">License Status</label>
                <select
                  value={formData.status || "ACTIVE"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="bg-surface2/40 border border-border rounded-sm py-2 px-2 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="BLACKLISTED">Blacklisted</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant="primary">
              {loading ? "Generating..." : initialData ? "Save License" : "Issue License Key"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
