"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";
import { 
  Download, 
  Upload, 
  Search, 
  Filter, 
  HardDrive, 
  Package, 
  Tag, 
  FileCode, 
  RefreshCw, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers,
  CheckCircle2
} from "lucide-react";
import { ReleaseModal, type ReleaseFormData } from "@/components/releases/release-modal";

interface ProductItem {
  id: string;
  name: string;
  category?: string;
}

interface ReleaseRecord {
  id: string;
  productId: string;
  version: string;
  fileName?: string | null;
  fileUrl: string;
  storagePath?: string | null;
  fileType: string;
  platform: string;
  fileSize?: number | null;
  checksum?: string | null;
  releaseNotes: string;
  isForceUpdate: boolean;
  isLatest: boolean;
  createdAt: string;
  product?: {
    id: string;
    name: string;
  };
  _count?: {
    downloads: number;
  };
}

export default function DownloadsAndExtensionsPage() {
  const toast = useToast();
  const [releases, setReleases] = useState<ReleaseRecord[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filters
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("ALL");
  const [selectedPlatform, setSelectedPlatform] = useState("ALL");
  const [selectedFileType, setSelectedFileType] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    totalDownloads: 0,
    totalReleases: 0,
  });

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<ReleaseFormData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchReleasesAndStats = async () => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams({
        search,
        productId: selectedProduct,
        platform: selectedPlatform,
        fileType: selectedFileType,
        page: page.toString(),
        limit: "8",
      });

      const [resReleases, resProducts, resStats] = await Promise.all([
        fetch(`/api/releases?${queryParams.toString()}`),
        fetch("/api/products"),
        fetch("/api/downloads"),
      ]);

      const dataReleases = await resReleases.json();
      const dataProducts = await resProducts.json();
      const dataStats = await resStats.json();

      if (resReleases.ok) {
        setReleases(dataReleases.releases || []);
        if (dataReleases.pagination) {
          setTotalPages(dataReleases.pagination.totalPages || 1);
          setTotalCount(dataReleases.pagination.total || 0);
        }
      } else {
        setError(dataReleases.message || "Failed to load software releases.");
      }

      if (resProducts.ok) {
        setProducts(dataProducts.products || []);
      }

      if (resStats.ok && dataStats.stats) {
        setStats({
          totalDownloads: dataStats.stats.totalDownloads || 0,
          totalReleases: dataStats.stats.totalReleases || 0,
        });
      }
    } catch (err) {
      setError("Error connecting to Releases API endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleasesAndStats();
  }, [search, selectedProduct, selectedPlatform, selectedFileType, page]);

  const handleCreateNew = () => {
    setEditingRelease(null);
    setIsModalOpen(true);
  };

  const handleEdit = (rel: ReleaseRecord) => {
    setEditingRelease({
      id: rel.id,
      productId: rel.productId,
      version: rel.version,
      fileName: rel.fileName || "",
      fileUrl: rel.fileUrl,
      platform: rel.platform,
      fileType: rel.fileType,
      releaseNotes: rel.releaseNotes,
      isForceUpdate: rel.isForceUpdate,
      isLatest: rel.isLatest,
    });
    setIsModalOpen(true);
  };

  const handleSaveRelease = async (formData: ReleaseFormData) => {
    setModalLoading(true);
    try {
      const isEdit = !!formData.id;
      const url = isEdit ? `/api/releases/${formData.id}` : "/api/releases";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Release package ${isEdit ? "updated" : "published"} successfully!`);
        setIsModalOpen(false);
        fetchReleasesAndStats();
      } else {
        toast.error(data.message || "Failed to save release package.");
      }
    } catch (err) {
      toast.error("Error saving release package.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleRollbackLatest = async (rel: ReleaseRecord) => {
    if (!confirm(`Rollback: Set version "${rel.version}" as the active latest version for ${rel.product?.name}?`)) return;

    try {
      const res = await fetch(`/api/releases/${rel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLatest: true }),
      });

      if (res.ok) {
        toast.success(`Version ${rel.version} is now active latest for ${rel.product?.name}.`);
        fetchReleasesAndStats();
      } else {
        toast.error("Failed to set active latest version.");
      }
    } catch (err) {
      toast.error("Error setting active latest version.");
    }
  };

  const handleDeleteRelease = async (id: string, version: string) => {
    if (!confirm(`Are you sure you want to delete release version "${version}"?`)) return;

    try {
      const res = await fetch(`/api/releases/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Release version ${version} deleted.`);
        fetchReleasesAndStats();
      } else {
        toast.error("Failed to delete release.");
      }
    } catch (err) {
      toast.error("Error deleting release.");
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "WINDOWS":
        return <Badge variant="info">WINDOWS</Badge>;
      case "MACOS":
        return <Badge variant="neutral">MACOS</Badge>;
      case "LINUX":
        return <Badge variant="warning">LINUX</Badge>;
      case "CHROME":
        return <Badge variant="active">CHROME</Badge>;
      case "EDGE":
        return <Badge variant="info">EDGE</Badge>;
      default:
        return <Badge variant="neutral">{platform}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">Downloads & File Release Management</h2>
          <p className="text-xs text-muted">Manage downloadable installers, CRX extensions, zips, and version rollbacks in Supabase Storage.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan" : ""}`} />}
            onClick={fetchReleasesAndStats}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Upload className="w-3.5 h-3.5" />}
            onClick={handleCreateNew}
          >
            Publish Release
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard accent="cyan" className="flex justify-between items-center p-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Downloads</span>
            <span className="text-2xl font-bold font-bricolage text-white mt-1">{stats.totalDownloads}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan">
            <Download className="w-4 h-4" />
          </div>
        </GlassCard>

        <GlassCard accent="green" className="flex justify-between items-center p-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Published Releases</span>
            <span className="text-2xl font-bold font-bricolage text-green mt-1">{stats.totalReleases || totalCount}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-green/10 border border-green/20 flex items-center justify-center text-green">
            <Package className="w-4 h-4" />
          </div>
        </GlassCard>

        <GlassCard accent="gold" className="flex justify-between items-center p-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Storage Buckets</span>
            <span className="text-2xl font-bold font-bricolage text-gold mt-1">7 Active</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
            <HardDrive className="w-4 h-4" />
          </div>
        </GlassCard>

        <GlassCard accent="violet" className="flex justify-between items-center p-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Supported Formats</span>
            <span className="text-2xl font-bold font-bricolage text-violet mt-1">10 Formats</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-violet/10 border border-violet/20 flex items-center justify-center text-violet">
            <FileCode className="w-4 h-4" />
          </div>
        </GlassCard>
      </div>

      {/* Filter Bar */}
      <GlassCard className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              placeholder="Search release version, notes or file..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="w-3.5 h-3.5 text-muted" />}
            />
          </div>

          <select
            value={selectedProduct}
            onChange={(e) => { setSelectedProduct(e.target.value); setPage(1); }}
            className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground text-xs focus:outline-none w-full"
          >
            <option value="ALL">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedPlatform}
            onChange={(e) => { setSelectedPlatform(e.target.value); setPage(1); }}
            className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground text-xs focus:outline-none w-full"
          >
            <option value="ALL">All Platforms</option>
            <option value="UNIVERSAL">Universal</option>
            <option value="WINDOWS">Windows</option>
            <option value="MACOS">macOS</option>
            <option value="LINUX">Linux</option>
            <option value="CHROME">Chrome Extension</option>
            <option value="EDGE">Edge Extension</option>
          </select>

          <select
            value={selectedFileType}
            onChange={(e) => { setSelectedFileType(e.target.value); setPage(1); }}
            className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground text-xs focus:outline-none w-full"
          >
            <option value="ALL">All File Formats</option>
            <option value="ZIP">ZIP</option>
            <option value="CRX">CRX</option>
            <option value="EXE">EXE</option>
            <option value="MSI">MSI</option>
            <option value="DMG">DMG</option>
            <option value="APPIMAGE">AppImage</option>
          </select>
        </div>
      </GlassCard>

      {/* Releases Data Table */}
      <GlassCard className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-16 text-muted">Loading software release packages...</div>
        ) : error ? (
          <div className="text-center py-16 text-red font-semibold">{error}</div>
        ) : releases.length === 0 ? (
          <div className="text-center py-16 text-muted flex flex-col items-center justify-center gap-2">
            <Package className="w-8 h-8 text-muted/50" />
            <span>No software packages published yet.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Software Product</th>
                  <th className="py-3">Version</th>
                  <th className="py-3">Platform</th>
                  <th className="py-3">Format</th>
                  <th className="py-3">Downloads</th>
                  <th className="py-3">Released Date</th>
                  <th className="py-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {releases.map((rel) => (
                  <tr key={rel.id} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                    <td className="py-4 px-4 font-bold text-white">
                      <div className="flex flex-col">
                        <span>{rel.product?.name || "Product"}</span>
                        <span className="text-[10px] text-muted font-mono font-normal">{rel.fileName}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 font-mono text-cyan font-bold">
                        <span>{rel.version}</span>
                        {rel.isLatest && <Badge variant="active" className="text-[9px]">LATEST</Badge>}
                      </div>
                    </td>
                    <td className="py-4">{getPlatformBadge(rel.platform)}</td>
                    <td className="py-4 font-bold text-foreground text-[10px]">{rel.fileType}</td>
                    <td className="py-4 font-mono text-cyan font-bold text-[11px]">
                      {rel._count?.downloads || 0}
                    </td>
                    <td className="py-4 text-muted text-[10px]">
                      {new Date(rel.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex justify-end items-center gap-2">
                        <a
                          href={rel.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:text-cyan transition-all text-muted"
                          title="Download Package"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {!rel.isLatest && (
                          <button
                            onClick={() => handleRollbackLatest(rel)}
                            className="p-1 hover:text-green transition-all text-muted"
                            title="Rollback / Set as Active Latest Version"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-green" />
                          </button>
                        )}

                        <button
                          onClick={() => handleEdit(rel)}
                          className="p-1 hover:text-cyan transition-all text-muted"
                          title="Edit Release Package"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteRelease(rel.id, rel.version)}
                          className="p-1 hover:text-red transition-all text-muted"
                          title="Delete Release Package"
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-4 px-2">
            <span className="text-muted text-[10px]">
              Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span> ({totalCount} total packages)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                icon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                icon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Release Modal */}
      <ReleaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRelease}
        products={products}
        initialData={editingRelease}
        loading={modalLoading}
      />
    </div>
  );
}
