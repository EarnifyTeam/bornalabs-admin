"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { 
  Upload, 
  FileArchive, 
  AlertTriangle,
  History,
  Undo2,
  RefreshCw
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
}

interface ReleaseData {
  id: string;
  version: string;
  releaseNotes: string;
  isForceUpdate: boolean;
  fileUrl: string;
  fileType: string;
  supportedBrowsers: string[];
  createdAt: string;
  product: Product;
}

export default function ExtensionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [releases, setReleases] = useState<ReleaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload Form State
  const [selectedProductSlug, setSelectedProductSlug] = useState("");
  const [version, setVersion] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("ZIP");
  const [isForceUpdate, setIsForceUpdate] = useState(false);
  const [supportedBrowsers, setSupportedBrowsers] = useState<string[]>(["Chrome", "Edge", "Brave"]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [prodRes, relRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/releases")
      ]);

      const prodData = await prodRes.json();
      const relData = await relRes.json();

      if (prodRes.ok && relRes.ok) {
        setProducts(prodData.products || []);
        if (prodData.products?.length > 0) {
          setSelectedProductSlug(prodData.products[0].slug);
        }
        setReleases(relData.releases || []);
      } else {
        setError("Failed to query catalog databases.");
      }
    } catch (err) {
      setError("Network connection timeout.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBrowserToggle = (browser: string) => {
    if (supportedBrowsers.includes(browser)) {
      setSupportedBrowsers(supportedBrowsers.filter((b) => b !== browser));
    } else {
      setSupportedBrowsers([...supportedBrowsers, browser]);
    }
  };

  const handlePublishRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductSlug) {
      alert("Please select a target product catalog.");
      return;
    }
    setSubmitting(true);

    try {
      const response = await fetch("/api/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: selectedProductSlug,
          version,
          releaseNotes,
          fileUrl,
          fileType,
          isForceUpdate,
          supportedBrowsers,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setVersion("");
        setReleaseNotes("");
        setFileUrl("");
        setSupportedBrowsers(["Chrome", "Edge", "Brave"]);
        setIsForceUpdate(false);
        fetchData();
        alert("Release build published successfully!");
      } else {
        alert("Failed to publish release: " + data.error);
      }
    } catch (err) {
      alert("Network error publishing build.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRollbackRelease = async (releaseId: string) => {
    if (!confirm("Are you sure you want to rollback and delete this release from records?")) return;

    try {
      const response = await fetch(`/api/releases/${releaseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchData();
        alert("Rollback successful! Release record removed.");
      } else {
        const data = await response.json();
        alert("Failed to rollback: " + data.error);
      }
    } catch (err) {
      alert("Error sending rollback request.");
    }
  };

  return (
    <div className="flex flex-col gap-8 text-xs relative">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">Release & Extension Manager</h2>
          <p className="text-xs text-muted">Upload and publish builds, trigger force updates, and rollback browser extension releases.</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 text-xs font-bold text-white bg-surface border border-border px-4 py-2.5 rounded-sm hover:bg-surface/60 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan" : ""}`} />
          Refresh
        </button>
      </div>

      {loading && products.length === 0 ? (
        <div className="text-center py-12 text-muted">Loading releases catalog...</div>
      ) : error ? (
        <div className="text-center py-12 text-red font-semibold">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Upload Form Panel */}
          <GlassCard hoverable={false} className="lg:col-span-1 flex flex-col gap-5">
            <div className="border-b border-border pb-3">
              <h3 className="font-bricolage font-bold text-sm text-white">Upload New Build</h3>
              <p className="text-[10px] text-muted">Publish ZIP, EXE, or CRX packages to extension stores.</p>
            </div>

            <form onSubmit={handlePublishRelease} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">Target Product</label>
                <select 
                  value={selectedProductSlug}
                  onChange={(e) => setSelectedProductSlug(e.target.value)}
                  className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none w-full"
                >
                  <option value="">Select a product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.slug}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">Release Version</label>
                <input 
                  type="text" 
                  required
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 1.4.3" 
                  className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none placeholder:text-muted/40 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">Release Binary URL</label>
                <input 
                  type="text" 
                  required
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://cdn.bornalabs.com/..." 
                  className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none placeholder:text-muted/40 w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[10px] uppercase">Package Type</label>
                  <select 
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none w-full"
                  >
                    <option value="ZIP">ZIP Package</option>
                    <option value="CRX">CRX Extension</option>
                    <option value="EXE">EXE Windows Installer</option>
                    <option value="DMG">DMG macOS Installer</option>
                    <option value="OTHER">Other Binary</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">Release Notes</label>
                <textarea 
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="Describe update notes..." 
                  rows={2}
                  className="bg-surface2/40 border border-border rounded-sm p-2 text-foreground focus:outline-none placeholder:text-muted/40 w-full resize-none"
                />
              </div>

              {/* Browsers Checklist */}
              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[10px] uppercase">Supported Browsers</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {["Chrome", "Edge", "Brave", "Opera"].map((browser, idx) => (
                    <label key={idx} className="flex items-center gap-2 text-[11px] text-muted cursor-pointer hover:text-foreground">
                      <input 
                        type="checkbox" 
                        checked={supportedBrowsers.includes(browser)}
                        onChange={() => handleBrowserToggle(browser)}
                        className="rounded border-border bg-surface text-cyan focus:ring-0" 
                      />
                      {browser}
                    </label>
                  ))}
                </div>
              </div>

              {/* Force Update Trigger */}
              <div className="flex items-center justify-between p-3 border border-red/20 bg-red/5 rounded-sm">
                <div className="flex flex-col gap-0.5 max-w-[180px]">
                  <span className="font-bold text-[10px] text-red uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Force Update
                  </span>
                  <span className="text-[9px] text-muted leading-tight">Force client extensions to download build immediately.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={isForceUpdate}
                  onChange={(e) => setIsForceUpdate(e.target.checked)}
                  className="w-4 h-4 rounded border-red bg-surface text-red focus:ring-0 cursor-pointer" 
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full text-center text-xs font-bold text-white bg-gradient-to-tr from-cyan to-violet py-2.5 rounded-sm shadow-md hover:opacity-90 transition-all mt-2 disabled:opacity-50"
              >
                {submitting ? "Publishing build..." : "Publish Release Build"}
              </button>
            </form>
          </GlassCard>

          {/* Versions History & Rollbacks */}
          <GlassCard hoverable={false} className="lg:col-span-2 flex flex-col gap-4">
            <div className="border-b border-border pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-bricolage font-bold text-sm text-white">Release Version History</h3>
                <p className="text-[10px] text-muted">Audit logs of all browser extension package publications.</p>
              </div>
              <span className="text-[9px] text-muted flex items-center gap-1">
                <History className="w-3.5 h-3.5" />
                {releases.length} releases logged
              </span>
            </div>

            <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
              {releases.length === 0 ? (
                <div className="text-center py-12 text-muted">No version builds published yet.</div>
              ) : (
                releases.map((v, idx) => (
                  <div key={idx} className="p-4 rounded-sm bg-surface2/20 border border-border flex justify-between items-start text-xs">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan text-[13px]">{v.version}</span>
                        <span className="text-[9px] text-muted">({v.product.name})</span>
                        <span className="text-[9px] text-muted">{new Date(v.createdAt).toLocaleString()}</span>
                        {idx === 0 && (
                          <span className="text-[8px] bg-green/10 border border-green/20 text-green font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            Latest Release
                          </span>
                        )}
                      </div>
                      <p className="text-muted text-[10px] bg-surface/10 p-2 rounded-sm italic">
                        {v.releaseNotes || "No release notes provided."}
                      </p>
                      <div className="flex items-center gap-3 text-muted text-[10px]">
                        <span className="flex items-center gap-1 font-semibold text-white">
                          <FileArchive className="w-3.5 h-3.5 text-violet" />
                          {v.fileType} • <a href={v.fileUrl} target="_blank" rel="noopener noreferrer" className="text-cyan underline">Download Link</a>
                        </span>
                        <span>•</span>
                        <span>Browsers: {v.supportedBrowsers.join(", ")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {v.isForceUpdate && (
                        <span className="text-[8px] bg-red/10 border border-red/20 text-red font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                          Force Trigger
                        </span>
                      )}
                      <button 
                        onClick={() => handleRollbackRelease(v.id)}
                        className="flex items-center gap-1.5 text-[10px] font-bold border border-border bg-surface2/30 px-3 py-1.5 rounded-sm text-muted hover:text-red hover:border-red/20 transition-all"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        Rollback
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
