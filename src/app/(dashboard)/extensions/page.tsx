"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";
import { 
  Puzzle, 
  Download, 
  Plus, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  ShieldAlert, 
  Activity,
  Layers,
  AlertCircle
} from "lucide-react";
import { ReleaseModal, type ReleaseFormData } from "@/components/downloads/release-modal";

interface ReleaseRecord {
  id: string;
  version: string;
  releaseNotes: string;
  fileUrl: string;
  fileType: string;
  isForceUpdate: boolean;
  supportedBrowsers: string[];
  createdAt: string;
  product: {
    id: string;
    name: string;
    category: string;
  };
  _count?: {
    downloads: number;
  };
}

interface DownloadRecord {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  product: {
    name: string;
  };
  release?: {
    version: string;
  } | null;
}

interface ProductItem {
  id: string;
  name: string;
}

export default function ExtensionsPage() {
  const toast = useToast();
  const [releases, setReleases] = useState<ReleaseRecord[]>([]);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchReleasesAndDownloads = async () => {
    setLoading(true);
    setError("");
    try {
      const [resReleases, resDownloads, resProducts] = await Promise.all([
        fetch("/api/releases"),
        fetch("/api/downloads"),
        fetch("/api/products"),
      ]);

      const dataReleases = await resReleases.json();
      const dataDownloads = await resDownloads.json();
      const dataProducts = await resProducts.json();

      if (resReleases.ok) setReleases(dataReleases.releases || []);
      if (resDownloads.ok) setDownloads(dataDownloads.downloads || []);
      if (resProducts.ok) setProducts(dataProducts.products || []);
    } catch (err) {
      setError("Error connecting to releases & downloads telemetry APIs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleasesAndDownloads();
  }, []);

  const handleSaveRelease = async (formData: ReleaseFormData) => {
    setModalLoading(true);
    try {
      const res = await fetch("/api/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Release version ${formData.version} published successfully!`);
        setIsModalOpen(false);
        fetchReleasesAndDownloads();
      } else {
        toast.error(data.error || "Failed to publish release.");
      }
    } catch (err) {
      toast.error("Error connecting to release API.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteRelease = async (id: string, version: string) => {
    if (!confirm(`Are you sure you want to delete release version "${version}"?`)) return;

    try {
      const res = await fetch(`/api/releases/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`Release ${version} deleted.`);
        fetchReleasesAndDownloads();
      } else {
        toast.error("Failed to delete release.");
      }
    } catch (err) {
      toast.error("Error deleting release log.");
    }
  };

  const triggerDownload = async (rel: ReleaseRecord) => {
    // Record download telemetry
    try {
      await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: rel.product.id,
          releaseId: rel.id,
        }),
      });
      fetchReleasesAndDownloads();
    } catch (err) {
      console.error("Failed to log download event:", err);
    }

    // Trigger file download
    window.open(rel.fileUrl, "_blank");
  };

  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">Chrome Extensions & Releases</h2>
          <p className="text-xs text-muted">Browser extension CRX/ZIP binary releases and global download telemetry audit logs in Supabase DB.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan" : ""}`} />}
            onClick={fetchReleasesAndDownloads}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Publish Release
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard accent="cyan" className="flex justify-between items-center p-6">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-muted uppercase">Active Software Releases</span>
            <span className="text-3xl font-bold font-bricolage text-white mt-1">{releases.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan">
            <Layers className="w-5 h-5" />
          </div>
        </GlassCard>

        <GlassCard accent="gold" className="flex justify-between items-center p-6">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-muted uppercase">Global Download Events</span>
            <span className="text-3xl font-bold font-bricolage text-white mt-1">{downloads.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
            <Download className="w-5 h-5" />
          </div>
        </GlassCard>
      </div>

      {/* Active Releases Section */}
      <GlassCard className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div>
            <h3 className="font-bricolage font-bold text-sm text-white">Active Software Binary Releases</h3>
            <p className="text-[10px] text-muted">Deployed release packages and extension manifests.</p>
          </div>
          <Badge variant="info">Supabase Storage</Badge>
        </div>

        {loading && releases.length === 0 ? (
          <div className="text-center py-12 text-muted">Loading software releases...</div>
        ) : error ? (
          <div className="text-center py-12 text-red font-semibold">{error}</div>
        ) : releases.length === 0 ? (
          <div className="text-center py-12 text-muted flex flex-col items-center justify-center gap-2">
            <Puzzle className="w-8 h-8 text-muted/50" />
            <span>No software releases published yet.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Software Name</th>
                  <th className="py-3">Version</th>
                  <th className="py-3">Format</th>
                  <th className="py-3">Update Type</th>
                  <th className="py-3">Supported Browsers</th>
                  <th className="py-3">Release Date</th>
                  <th className="py-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {releases.map((rel, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                    <td className="py-4 px-4 font-bold text-white">
                      <div className="flex flex-col">
                        <span>{rel.product?.name || "Product"}</span>
                        {rel.releaseNotes && (
                          <span className="text-[10px] text-muted max-w-xs truncate font-normal">
                            {rel.releaseNotes}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 font-mono font-bold text-cyan text-[11px]">{rel.version}</td>
                    <td className="py-4">
                      <span className="font-mono font-bold text-[9px] bg-surface2/40 border border-border px-2 py-0.5 rounded-sm">
                        {rel.fileType}
                      </span>
                    </td>
                    <td className="py-4">
                      <Badge variant={rel.isForceUpdate ? "danger" : "active"}>
                        {rel.isForceUpdate ? "FORCE" : "LIVE"}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-1 flex-wrap">
                        {rel.supportedBrowsers.map((b, i) => (
                          <span key={i} className="text-[8px] font-bold px-1.5 py-0.5 rounded-sm bg-cyan/10 border border-cyan/20 text-cyan">
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 text-muted text-[10px]">
                      {new Date(rel.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex justify-end gap-2 text-muted">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Download className="w-3 h-3" />}
                          onClick={() => triggerDownload(rel)}
                        >
                          Download
                        </Button>
                        <button
                          onClick={() => handleDeleteRelease(rel.id, rel.version)}
                          className="p-1 hover:text-red transition-all"
                          title="Delete Release Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Global Downloads Telemetry Stream */}
      <GlassCard className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div>
            <h3 className="font-bricolage font-bold text-sm text-white">Global Downloads Telemetry Stream</h3>
            <p className="text-[10px] text-muted">Audit log stream of client download requests.</p>
          </div>
          <span className="flex items-center gap-1.5 text-[9px] font-bold bg-green/10 border border-green/20 text-green px-2 py-0.5 rounded-sm uppercase">
            <Activity className="w-2.5 h-2.5" />
            Live Audit Stream
          </span>
        </div>

        {downloads.length === 0 ? (
          <div className="text-center py-8 text-muted flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-muted/60" />
            No download telemetry events logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Software Name</th>
                  <th className="py-2.5">Release Version</th>
                  <th className="py-2.5">IP Address</th>
                  <th className="py-2.5">User Agent</th>
                  <th className="py-2.5 text-right pr-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {downloads.map((d, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                    <td className="py-3 px-4 font-bold text-white">{d.product?.name || "Product"}</td>
                    <td className="py-3 font-mono font-bold text-cyan text-[11px]">
                      {d.release?.version || "Latest"}
                    </td>
                    <td className="py-3 font-mono text-muted text-[11px]">{d.ipAddress || "127.0.0.1"}</td>
                    <td className="py-3 text-muted text-[10px] max-w-xs truncate">{d.userAgent || "BornaLabs Client"}</td>
                    <td className="py-3 text-right pr-4 text-muted text-[10px]">
                      {new Date(d.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Release Modal */}
      <ReleaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRelease}
        products={products}
        loading={modalLoading}
      />
    </div>
  );
}
