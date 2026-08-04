"use client";

import React, { useState } from "react";
import { X, Layers, Copy, Check, Download } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast";

interface ProductItem {
  id: string;
  name: string;
}

interface BulkLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onGenerate: (data: any) => Promise<any[] | null>;
}

export function BulkLicenseModal({
  isOpen,
  onClose,
  products,
  onGenerate,
}: BulkLicenseModalProps) {
  const toast = useToast();
  const [count, setCount] = useState("10");
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [type, setType] = useState("TRIAL");
  const [prefix, setPrefix] = useState("BULK");
  const [deviceLimit, setDeviceLimit] = useState(1);
  const [durationDays, setDurationDays] = useState("30");
  const [loading, setLoading] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedKeys([]);

    const result = await onGenerate({
      count,
      productId: productId || products[0]?.id,
      type,
      prefix,
      deviceLimit,
      durationDays,
    });

    setLoading(false);

    if (result && Array.isArray(result)) {
      const keys = result.map((item) => item.licenseKey);
      setGeneratedKeys(keys);
      toast.success(`Successfully generated ${keys.length} license keys in batch!`);
    }
  };

  const copyAllKeys = () => {
    if (generatedKeys.length === 0) return;
    navigator.clipboard.writeText(generatedKeys.join("\n"));
    setCopied(true);
    toast.success("All generated keys copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    if (generatedKeys.length === 0) return;
    const content = "data:text/csv;charset=utf-8,LicenseKey\n" + generatedKeys.join("\n");
    const encodedUri = encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bornalabs-batch-licenses-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <GlassCard hoverable={false} className="w-full max-w-lg flex flex-col gap-6 p-6 relative border-gold/20">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bricolage font-bold text-base text-white">Bulk License Key Generator</h3>
              <p className="text-[10px] text-muted">Generate batch license keys for reseller distribution or promotion.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-white hover:bg-surface/40 rounded-sm transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {generatedKeys.length === 0 ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Batch Quantity (Max 100)"
                type="number"
                min={1}
                max={100}
                required
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">Target Product</label>
                <select
                  value={productId || products[0]?.id}
                  onChange={(e) => setProductId(e.target.value)}
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
                  value={type}
                  onChange={(e) => setType(e.target.value)}
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
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                placeholder="BULK"
              />

              <Input
                label="Device Limit"
                type="number"
                min={1}
                max={100}
                required
                value={deviceLimit}
                onChange={(e) => setDeviceLimit(parseInt(e.target.value || "1"))}
              />
            </div>

            <Input
              label="Validity Duration (Days)"
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="30"
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} variant="primary">
                {loading ? "Generating Batch..." : `Generate ${count} Keys`}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-xs">
                Generated {generatedKeys.length} Batch License Keys
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" icon={<Copy className="w-3.5 h-3.5" />} onClick={copyAllKeys}>
                  {copied ? "Copied!" : "Copy All"}
                </Button>
                <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={exportCSV}>
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="bg-surface2/40 border border-border rounded-sm p-3 max-h-56 overflow-y-auto font-mono text-[11px] text-cyan flex flex-col gap-1">
              {generatedKeys.map((key, idx) => (
                <div key={idx} className="flex justify-between py-0.5 border-b border-border/40 last:border-0">
                  <span>{key}</span>
                  <span className="text-muted text-[9px]">Key #{idx + 1}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
