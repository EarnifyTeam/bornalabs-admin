"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, FileCode, CheckCircle2, HardDrive, Tag, Layers } from "lucide-react";

export interface ReleaseFormData {
  id?: string;
  productId: string;
  version: string;
  fileName: string;
  fileUrl: string;
  storagePath?: string;
  platform: string;
  fileType: string;
  fileSize?: string;
  checksum?: string;
  releaseNotes: string;
  isForceUpdate: boolean;
  isLatest: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  category?: string;
}

interface ReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReleaseFormData) => Promise<void>;
  products: ProductItem[];
  initialData?: ReleaseFormData | null;
  loading?: boolean;
}

const defaultFormData: ReleaseFormData = {
  productId: "",
  version: "1.0.0",
  fileName: "",
  fileUrl: "",
  platform: "UNIVERSAL",
  fileType: "ZIP",
  releaseNotes: "",
  isForceUpdate: false,
  isLatest: true,
};

export function ReleaseModal({
  isOpen,
  onClose,
  onSave,
  products,
  initialData,
  loading = false,
}: ReleaseModalProps) {
  const [formData, setFormData] = useState<ReleaseFormData>(defaultFormData);

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
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-4">
          <div>
            <h2 className="font-bricolage font-bold text-lg text-white">
              {initialData ? "Edit Software Release Package" : "Publish New Release Package"}
            </h2>
            <p className="text-xs text-muted">Upload binary installers, CRX extensions or zip bundles to Supabase Storage.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-sm text-muted hover:text-foreground hover:bg-surface2/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-bold text-[10px] uppercase">Target Product *</label>
            <select
              required
              value={formData.productId}
              onChange={(e) => setFormData((prev) => ({ ...prev, productId: e.target.value }))}
              className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
            >
              <option value="" disabled>Select target product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Release Version *"
              required
              value={formData.version}
              onChange={(e) => setFormData((prev) => ({ ...prev, version: e.target.value }))}
              placeholder="e.g. 1.2.0"
              leftIcon={<Tag className="w-4 h-4 text-cyan" />}
            />

            <Input
              label="File Name"
              value={formData.fileName}
              onChange={(e) => setFormData((prev) => ({ ...prev, fileName: e.target.value }))}
              placeholder="promptx-v1.2.0.zip"
              leftIcon={<FileCode className="w-4 h-4 text-muted" />}
            />
          </div>

          <Input
            label="File Download URL / Supabase Storage Path *"
            required
            value={formData.fileUrl}
            onChange={(e) => setFormData((prev) => ({ ...prev, fileUrl: e.target.value }))}
            placeholder="https://iuzdqwgdetxyxyqsfvet.supabase.co/storage/v1/object/public/software/build.zip"
            leftIcon={<Upload className="w-4 h-4 text-muted" />}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Target Platform *</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData((prev) => ({ ...prev, platform: e.target.value }))}
                className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              >
                <option value="UNIVERSAL">Universal Multi-Platform</option>
                <option value="WINDOWS">Windows (x64 / ARM)</option>
                <option value="MACOS">macOS (Apple Silicon / Intel)</option>
                <option value="LINUX">Linux (x86_64 / AppImage)</option>
                <option value="CHROME">Google Chrome Extension</option>
                <option value="EDGE">Microsoft Edge Extension</option>
                <option value="BRAVE">Brave Browser</option>
                <option value="OPERA">Opera Browser</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">File Extension / Format *</label>
              <select
                value={formData.fileType}
                onChange={(e) => setFormData((prev) => ({ ...prev, fileType: e.target.value }))}
                className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
              >
                <option value="ZIP">ZIP Archive (.zip)</option>
                <option value="CRX">Chrome Extension (.crx)</option>
                <option value="EXE">Windows Executable (.exe)</option>
                <option value="MSI">Windows Installer (.msi)</option>
                <option value="DMG">macOS Disk Image (.dmg)</option>
                <option value="APPIMAGE">Linux AppImage (.AppImage)</option>
                <option value="DEB">Debian Package (.deb)</option>
                <option value="RPM">RedHat Package (.rpm)</option>
                <option value="APK">Android APK (.apk)</option>
                <option value="PDF">Document PDF (.pdf)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 p-3 bg-surface2/20 border border-border rounded-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isLatest}
                onChange={(e) => setFormData((prev) => ({ ...prev, isLatest: e.target.checked }))}
                className="accent-cyan w-4 h-4 rounded"
              />
              <span className="text-white font-bold text-xs">Set as Active Latest Version</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isForceUpdate}
                onChange={(e) => setFormData((prev) => ({ ...prev, isForceUpdate: e.target.checked }))}
                className="accent-red w-4 h-4 rounded"
              />
              <span className="text-red font-bold text-xs">Require Force Update</span>
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-bold text-[10px] uppercase">Changelog & Release Notes</label>
            <textarea
              rows={3}
              value={formData.releaseNotes}
              onChange={(e) => setFormData((prev) => ({ ...prev, releaseNotes: e.target.value }))}
              placeholder="What's new in this release version..."
              className="bg-surface2/40 border border-border rounded-sm p-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-border pt-4 mt-2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Publishing Package..." : initialData ? "Update Release" : "Publish Release"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
