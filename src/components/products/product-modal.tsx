"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Sparkles, Globe, Github, Download, FileText, Image as ImageIcon, Check } from "lucide-react";

export interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  productType: string;
  version: string;
  price: string;
  status: string;
  isLicenseRequired: boolean;
  featured: boolean;
  iconUrl: string;
  bannerUrl: string;
  galleryImages: string[];
  downloadUrl: string;
  documentationUrl: string;
  githubUrl: string;
  websiteUrl: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData) => Promise<void>;
  initialData?: ProductFormData | null;
  loading?: boolean;
}

const defaultFormData: ProductFormData = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "DESKTOP_SOFTWARE",
  productType: "DESKTOP_SOFTWARE",
  version: "1.0.0",
  price: "0.00",
  status: "COMING_SOON",
  isLicenseRequired: true,
  featured: false,
  iconUrl: "",
  bannerUrl: "",
  galleryImages: [],
  downloadUrl: "",
  documentationUrl: "",
  githubUrl: "",
  websiteUrl: "",
};

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
}: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  const [galleryInput, setGalleryInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setIsAutoSlug(false);
      setGalleryInput(initialData.galleryImages?.join("\n") || "");
    } else {
      setFormData(defaultFormData);
      setIsAutoSlug(true);
      setGalleryInput("");
    }
  }, [initialData, isOpen]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isAutoSlug ? generateSlug(name) : prev.slug,
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const galleryArray = galleryInput
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    await onSave({
      ...formData,
      galleryImages: galleryArray,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <GlassCard hoverable={false} className="w-full max-w-3xl flex flex-col gap-6 p-6 my-8 max-h-[90vh] overflow-y-auto border-cyan/20">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-border pb-4">
          <div>
            <h2 className="font-bricolage font-bold text-lg text-white">
              {initialData ? "Edit Product" : "Create New Product"}
            </h2>
            <p className="text-xs text-muted">Configure product specifications and URLs in Supabase Database.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-sm text-muted hover:text-foreground hover:bg-surface2/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-xs">
          {/* Basic Info Section */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-cyan text-[11px] uppercase tracking-wider">Product Identification</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Product Name *"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. BornaLabs SEO Automator"
              />

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-muted font-bold text-[10px] uppercase">URL Slug *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoSlug(true);
                      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
                    }}
                    className="text-[9px] text-cyan hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5" /> Auto-Generate
                  </button>
                </div>
                <Input
                  required
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="bornalabs-seo-automator"
                />
              </div>
            </div>

            <Input
              label="Short Tagline Description"
              value={formData.shortDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
              placeholder="High-performance automated SEO backlink indexer extension."
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Full Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed product features, capabilities, and specifications..."
                className="bg-surface2/40 border border-border rounded-sm p-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all text-xs"
              />
            </div>
          </div>

          {/* Classification & Pricing */}
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <h3 className="font-bold text-cyan text-[11px] uppercase tracking-wider">Classification & Pricing</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
                >
                  <option value="AI_TOOL">AI Tool</option>
                  <option value="CHROME_EXTENSION">Chrome Extension</option>
                  <option value="DESKTOP_SOFTWARE">Desktop Software</option>
                  <option value="WEB_APPLICATION">Web Application</option>
                  <option value="AUTOMATION">Automation Tool</option>
                  <option value="API">API Service</option>
                  <option value="FUTURE_PRODUCT">Future Product</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">Product Type *</label>
                <select
                  value={formData.productType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, productType: e.target.value }))}
                  className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
                >
                  <option value="AI_TOOL">AI Tool</option>
                  <option value="CHROME_EXTENSION">Chrome Extension</option>
                  <option value="DESKTOP_SOFTWARE">Desktop Software</option>
                  <option value="WEB_APPLICATION">Web Application</option>
                  <option value="AUTOMATION">Automation Tool</option>
                  <option value="API">API Service</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="COMING_SOON">Coming Soon</option>
                  <option value="BETA">Beta</option>
                  <option value="LIVE">Live</option>
                  <option value="DEPRECATED">Deprecated</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Version String"
                value={formData.version}
                onChange={(e) => setFormData((prev) => ({ ...prev, version: e.target.value }))}
                placeholder="1.0.0"
              />

              <Input
                label="Price ($ USD)"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="49.99"
              />
            </div>

            <div className="flex gap-6 py-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-foreground">
                <input
                  type="checkbox"
                  checked={formData.isLicenseRequired}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isLicenseRequired: e.target.checked }))}
                  className="accent-cyan w-4 h-4 rounded-sm"
                />
                <span>Requires License Key Activation</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-foreground">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                  className="accent-gold w-4 h-4 rounded-sm"
                />
                <span>Mark as Featured Product</span>
              </label>
            </div>
          </div>

          {/* URLs & Resources */}
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <h3 className="font-bold text-cyan text-[11px] uppercase tracking-wider">Product URLs & Assets</h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Logo / Icon URL"
                value={formData.iconUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, iconUrl: e.target.value }))}
                placeholder="https://cdn.bornalabs.com/icons/app.png"
                leftIcon={<ImageIcon className="w-4 h-4 text-muted" />}
              />

              <Input
                label="Banner / Cover URL"
                value={formData.bannerUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, bannerUrl: e.target.value }))}
                placeholder="https://cdn.bornalabs.com/banners/app-banner.png"
                leftIcon={<ImageIcon className="w-4 h-4 text-muted" />}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Download URL"
                value={formData.downloadUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, downloadUrl: e.target.value }))}
                placeholder="https://downloads.bornalabs.com/app-v1.0.0.zip"
                leftIcon={<Download className="w-4 h-4 text-muted" />}
              />

              <Input
                label="Documentation URL"
                value={formData.documentationUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, documentationUrl: e.target.value }))}
                placeholder="https://docs.bornalabs.com/app"
                leftIcon={<FileText className="w-4 h-4 text-muted" />}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Official Website URL"
                value={formData.websiteUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                placeholder="https://bornalabs.com/app"
                leftIcon={<Globe className="w-4 h-4 text-muted" />}
              />

              <Input
                label="GitHub Repository URL"
                value={formData.githubUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/bornalabs/app"
                leftIcon={<Github className="w-4 h-4 text-muted" />}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-muted font-bold text-[10px] uppercase">Gallery Screenshot URLs (One URL per line)</label>
              <textarea
                rows={3}
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                placeholder="https://cdn.bornalabs.com/shot1.png&#10;https://cdn.bornalabs.com/shot2.png"
                className="bg-surface2/40 border border-border rounded-sm p-3 text-foreground focus:outline-none w-full focus:border-border-active transition-all text-xs font-mono"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving Product..." : initialData ? "Update Product" : "Publish Product"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
