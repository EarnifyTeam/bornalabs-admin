"use client";

import React, { useEffect, useState } from "react";
import { X, Package, Check, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: string;
  status: string;
  isLicenseRequired: boolean;
  downloadUrl: string;
  documentationUrl: string;
  iconUrl: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData) => Promise<void>;
  initialData?: ProductFormData | null;
  loading?: boolean;
}

export function ProductModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
}: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    category: "AI_TOOL",
    price: "0.00",
    status: "COMING_SOON",
    isLicenseRequired: true,
    downloadUrl: "",
    documentationUrl: "",
    iconUrl: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        category: "AI_TOOL",
        price: "0.00",
        status: "COMING_SOON",
        isLicenseRequired: true,
        downloadUrl: "",
        documentationUrl: "",
        iconUrl: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({
      ...prev,
      name,
      slug: initialData ? prev.slug : slug,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <GlassCard hoverable={false} className="w-full max-w-lg flex flex-col gap-6 p-6 relative border-cyan/20">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bricolage font-bold text-base text-white">
                {initialData ? "Edit Software Listing" : "New Product Listing"}
              </h3>
              <p className="text-[10px] text-muted">Configure product properties in Supabase database.</p>
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
              label="Product Name"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Prompt Detector Pro"
            />

            <Input
              label="Product Slug"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. prompt-detector-pro"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-bold text-[10px] uppercase">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of software capabilities..."
              className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-surface2/40 border border-border rounded-sm py-2 px-2 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              >
                <option value="AI_TOOL">AI Tool</option>
                <option value="CHROME_EXTENSION">Chrome Extension</option>
                <option value="DESKTOP_SOFTWARE">Desktop Software</option>
                <option value="AUTOMATION">Automation</option>
                <option value="API">API Service</option>
                <option value="FUTURE_PRODUCT">Future Product</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="bg-surface2/40 border border-border rounded-sm py-2 px-2 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              >
                <option value="LIVE">Live</option>
                <option value="BETA">Beta</option>
                <option value="COMING_SOON">Coming Soon</option>
                <option value="DEPRECATED">Deprecated</option>
              </select>
            </div>

            <Input
              label="Price ($ USD)"
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Download Binary URL"
              value={formData.downloadUrl}
              onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
              placeholder="https://..."
            />

            <Input
              label="Documentation Link"
              value={formData.documentationUrl}
              onChange={(e) => setFormData({ ...formData, documentationUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isLicenseRequired"
              checked={formData.isLicenseRequired}
              onChange={(e) => setFormData({ ...formData, isLicenseRequired: e.target.checked })}
              className="accent-cyan w-4 h-4 rounded-sm border-border cursor-pointer"
            />
            <label htmlFor="isLicenseRequired" className="text-xs font-semibold text-foreground cursor-pointer">
              Requires License Key Validation
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant="primary">
              {loading ? "Saving Record..." : initialData ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
