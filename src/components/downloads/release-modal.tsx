"use client";

import React, { useEffect, useState } from "react";
import { X, Upload, ShieldAlert, Sparkles, Globe } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ReleaseFormData {
  productId: string;
  version: string;
  fileType: string;
  fileUrl: string;
  isForceUpdate: boolean;
  supportedBrowsers: string[];
  releaseNotes: string;
}

interface ProductItem {
  id: string;
  name: string;
}

interface ReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReleaseFormData) => Promise<void>;
  products: ProductItem[];
  loading?: boolean;
}

export function ReleaseModal({
  isOpen,
  onClose,
  onSave,
  products,
  loading = false,
}: ReleaseModalProps) {
  const [formData, setFormData] = useState<ReleaseFormData>({
    productId: "",
    version: "v1.0.0",
    fileType: "ZIP",
    fileUrl: "",
    isForceUpdate: false,
    supportedBrowsers: ["Chrome", "Edge"],
    releaseNotes: "",
  });

  useEffect(() => {
    if (products.length > 0 && !formData.productId) {
      setFormData((prev) => ({ ...prev, productId: products[0].id }));
    }
  }, [products]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const toggleBrowser = (browser: string) => {
    setFormData((prev) => {
      const exists = prev.supportedBrowsers.includes(browser);
      return {
        ...prev,
        supportedBrowsers: exists
          ? prev.supportedBrowsers.filter((b) => b !== browser)
          : [...prev.supportedBrowsers, browser],
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <GlassCard hoverable={false} className="w-full max-w-lg flex flex-col gap-6 p-6 relative border-gold/20">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bricolage font-bold text-base text-white">Publish Software Release</h3>
              <p className="text-[10px] text-muted">Deploy extension CRX/ZIP binaries to Supabase DB.</p>
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
            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Target Product</label>
              <select
                value={formData.productId || products[0]?.id}
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

            <Input
              label="Version String"
              required
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="e.g. v1.2.0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Binary Format</label>
              <select
                value={formData.fileType}
                onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                className="bg-surface2/40 border border-border rounded-sm py-2 px-2 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              >
                <option value="CRX">Chrome CRX Package</option>
                <option value="ZIP">Archive ZIP</option>
                <option value="EXE">Windows EXE</option>
                <option value="MSI">Installer MSI</option>
                <option value="DMG">macOS DMG</option>
                <option value="DEB">Linux DEB</option>
                <option value="RPM">Linux RPM</option>
              </select>
            </div>

            <Input
              label="Binary File Download URL"
              required
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              placeholder="https://storage.bornalabs.com/..."
            />
          </div>

          {/* Supported Browsers */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-bold text-[10px] uppercase">Supported Browsers</label>
            <div className="flex gap-2">
              {["Chrome", "Edge", "Brave", "Opera"].map((browser, idx) => {
                const active = formData.supportedBrowsers.includes(browser);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleBrowser(browser)}
                    className={`px-3 py-1.5 rounded-sm text-[10px] font-bold border transition-all ${
                      active
                        ? "bg-cyan/20 border-cyan/40 text-cyan"
                        : "bg-surface border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {browser}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Force Update Toggle */}
          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="isForceUpdate"
              checked={formData.isForceUpdate}
              onChange={(e) => setFormData({ ...formData, isForceUpdate: e.target.checked })}
              className="accent-red w-4 h-4 rounded-sm border-border cursor-pointer"
            />
            <label htmlFor="isForceUpdate" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red" />
              Force Update Required (Mandatory client upgrade)
            </label>
          </div>

          {/* Release Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-bold text-[10px] uppercase">Release Notes & Changelog</label>
            <textarea
              rows={3}
              value={formData.releaseNotes}
              onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
              placeholder="Features added, performance improvements, bug fixes..."
              className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant="primary">
              {loading ? "Deploying Release..." : "Publish Release"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
