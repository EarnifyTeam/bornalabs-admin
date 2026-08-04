"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";
import { 
  Key, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Edit3
} from "lucide-react";
import { LicenseModal, type LicenseFormData } from "@/components/licenses/license-modal";
import { BulkLicenseModal, type BulkLicenseFormData } from "@/components/licenses/bulk-license-modal";

interface ProductItem {
  id: string;
  name: string;
  category?: string;
}

interface LicenseRecord {
  id: string;
  licenseKey: string;
  productId: string;
  userId: string;
  type: string;
  prefix: string;
  status: string;
  deviceLimit: number;
  currentDevices?: number;
  issuedAt?: string;
  expiresAt?: string | null;
  lastUsedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    category?: string;
  };
  user?: {
    id: string;
    email: string;
  };
  _count?: {
    devices: number;
  };
}

export default function LicensesPage() {
  const toast = useToast();
  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    expired: 0,
  });

  // Modal States
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<LicenseFormData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchLicensesAndProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams({
        search,
        productId: selectedProduct,
        type: selectedType,
        status: selectedStatus,
        page: page.toString(),
        limit: "8",
      });

      const [resLicenses, resProducts] = await Promise.all([
        fetch(`/api/licenses?${queryParams.toString()}`),
        fetch("/api/products"),
      ]);

      const dataLicenses = await resLicenses.json();
      const dataProducts = await resProducts.json();

      if (resLicenses.ok) {
        const fetchedLicenses = dataLicenses.licenses || [];
        setLicenses(fetchedLicenses);

        if (dataLicenses.pagination) {
          setTotalPages(dataLicenses.pagination.totalPages || 1);
          setTotalCount(dataLicenses.pagination.total || 0);
        }

        // Calculate summary metrics
        setMetrics({
          total: dataLicenses.pagination?.total || fetchedLicenses.length,
          active: fetchedLicenses.filter((l: any) => l.status === "ACTIVE").length,
          suspended: fetchedLicenses.filter((l: any) => l.status === "SUSPENDED").length,
          expired: fetchedLicenses.filter((l: any) => l.status === "EXPIRED" || l.status === "REVOKED").length,
        });
      } else {
        setError(dataLicenses.message || "Failed to load license keys.");
      }

      if (resProducts.ok) {
        setProducts(dataProducts.products || []);
      }
    } catch (err) {
      setError("Error connecting to Licenses API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicensesAndProducts();
  }, [search, selectedProduct, selectedType, selectedStatus, page]);

  const handleCreateSingle = () => {
    setEditingLicense(null);
    setIsSingleModalOpen(true);
  };

  const handleEdit = (lic: LicenseRecord) => {
    setEditingLicense({
      id: lic.id,
      productId: lic.productId,
      userId: lic.userId,
      userEmail: lic.user?.email || "",
      type: lic.type,
      customLicenseKey: lic.licenseKey,
      deviceLimit: lic.deviceLimit.toString(),
      expiryDays: "30",
      status: lic.status,
      notes: lic.notes || "",
    });
    setIsSingleModalOpen(true);
  };

  const handleSaveSingle = async (formData: LicenseFormData) => {
    setModalLoading(true);
    try {
      const isEdit = !!formData.id;
      const url = isEdit ? `/api/licenses/${formData.id}` : "/api/licenses";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`License key ${isEdit ? "updated" : "issued"} successfully!`);
        setIsSingleModalOpen(false);
        fetchLicensesAndProducts();
      } else {
        toast.error(data.message || "Failed to save license key.");
      }
    } catch (err) {
      toast.error("Error saving license key.");
    } flex: {
      setModalLoading(false);
    }
  };

  const handleSaveBulk = async (formData: BulkLicenseFormData): Promise<any[] | null> => {
    setModalLoading(true);
    try {
      const res = await fetch("/api/licenses/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Batch generated ${data.count} license keys successfully!`);
        fetchLicensesAndProducts();
        return data.licenses || data.keys || [];
      } else {
        toast.error(data.message || "Failed to generate bulk licenses.");
        return null;
      }
    } catch (err) {
      toast.error("Error generating bulk licenses.");
      return null;
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string, key: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`/api/licenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        toast.success(`License ${key} set to ${nextStatus}.`);
        fetchLicensesAndProducts();
      } else {
        toast.error("Failed to update status.");
      }
    } catch (err) {
      toast.error("Error updating license status.");
    }
  };

  const handleDelete = async (id: string, key: string) => {
    if (!confirm(`Are you sure you want to permanently delete license key "${key}"?`)) return;

    try {
      const res = await fetch(`/api/licenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`License key ${key} deleted.`);
        fetchLicensesAndProducts();
      } else {
        toast.error("Failed to delete license.");
      }
    } catch (err) {
      toast.error("Error deleting license.");
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("License key copied to clipboard!");
  };

  const exportCSV = () => {
    if (licenses.length === 0) {
      toast.error("No license records to export.");
      return;
    }

    const headers = ["License Key", "Product", "User Email", "Type", "Status", "Device Limit", "Created At"];
    const rows = licenses.map((l) => [
      l.licenseKey,
      l.product?.name || "Product",
      l.user?.email || "Unassigned",
      l.type,
      l.status,
      l.deviceLimit,
      new Date(l.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bornalabs_licenses_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report exported successfully!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="active">ACTIVE</Badge>;
      case "SUSPENDED":
        return <Badge variant="warning">SUSPENDED</Badge>;
      case "EXPIRED":
        return <Badge variant="danger">EXPIRED</Badge>;
      case "REVOKED":
        return <Badge variant="danger">REVOKED</Badge>;
      case "INACTIVE":
        return <Badge variant="neutral">INACTIVE</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">License Key Management</h2>
          <p className="text-xs text-muted">Issue, track, and manage license keys for PromptX, Chrome Extensions & SaaS software.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={exportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Layers className="w-3.5 h-3.5 text-cyan" />}
            onClick={() => setIsBulkModalOpen(true)}
          >
            Bulk Generator
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleCreateSingle}
          >
            Generate Key
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard accent="cyan" className="flex justify-between items-center p-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Issued</span>
            <span className="text-2xl font-bold font-bricolage text-white mt-1">{metrics.total}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan">
            <Key className="w-4 h-4" />
          </div>
        </GlassCard>

        <GlassCard accent="green" className="flex justify-between items-center p-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Active Keys</span>
            <span className="text-2xl font-bold font-bricolage text-green mt-1">{metrics.active}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-green/10 border border-green/20 flex items-center justify-center text-green">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </GlassCard>

        <GlassCard accent="gold" className="flex justify-between items-center p-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Suspended</span>
            <span className="text-2xl font-bold font-bricolage text-gold mt-1">{metrics.suspended}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </GlassCard>

        <GlassCard accent="red" className="flex justify-between items-center p-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Expired / Revoked</span>
            <span className="text-2xl font-bold font-bricolage text-red mt-1">{metrics.expired}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red/10 border border-red/20 flex items-center justify-center text-red">
            <XCircle className="w-4 h-4" />
          </div>
        </GlassCard>
      </div>

      {/* Filter Bar */}
      <GlassCard className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              placeholder="Search key, user or product..."
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
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
            className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground text-xs focus:outline-none w-full"
          >
            <option value="ALL">All License Types</option>
            <option value="TRIAL">Trial</option>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
            <option value="LIFETIME">Lifetime</option>
            <option value="CUSTOM">Custom</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
            className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground text-xs focus:outline-none w-full"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="EXPIRED">Expired</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </GlassCard>

      {/* Licenses Table */}
      <GlassCard className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-16 text-muted">Loading license records...</div>
        ) : error ? (
          <div className="text-center py-16 text-red font-semibold">{error}</div>
        ) : licenses.length === 0 ? (
          <div className="text-center py-16 text-muted flex flex-col items-center justify-center gap-2">
            <Key className="w-8 h-8 text-muted/50" />
            <span>No license keys found matching parameters.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">License Key</th>
                  <th className="py-3">Software Product</th>
                  <th className="py-3">Assigned User</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Device Limit</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((lic) => (
                  <tr key={lic.id} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                    <td className="py-4 px-4 font-mono font-bold text-cyan text-[11px]">
                      <div className="flex items-center gap-2">
                        <span>{lic.licenseKey}</span>
                        <button
                          onClick={() => handleCopyKey(lic.licenseKey)}
                          className="p-1 hover:text-white transition-all text-muted"
                          title="Copy Key"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-white">{lic.product?.name || "Product"}</td>
                    <td className="py-4 text-muted text-[11px]">{lic.user?.email || "Unassigned"}</td>
                    <td className="py-4 font-semibold text-foreground text-[10px]">{lic.type}</td>
                    <td className="py-4 font-mono text-muted text-[11px]">
                      <span className="text-cyan font-bold">{lic._count?.devices || lic.currentDevices || 0}</span> / {lic.deviceLimit}
                    </td>
                    <td className="py-4">{getStatusBadge(lic.status)}</td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleEdit(lic)}
                          className="p-1 hover:text-cyan transition-all text-muted"
                          title="Edit License"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(lic.id, lic.status, lic.licenseKey)}
                          className={`p-1 transition-all ${
                            lic.status === "ACTIVE" ? "hover:text-gold text-muted" : "hover:text-green text-muted"
                          }`}
                          title={lic.status === "ACTIVE" ? "Suspend License" : "Reactivate License"}
                        >
                          {lic.status === "ACTIVE" ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5 text-green" />}
                        </button>

                        <button
                          onClick={() => handleDelete(lic.id, lic.licenseKey)}
                          className="p-1 hover:text-red transition-all text-muted"
                          title="Delete License"
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
              Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span> ({totalCount} total keys)
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

      {/* Modals */}
      <LicenseModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        onSave={handleSaveSingle}
        products={products}
        initialData={editingLicense}
        loading={modalLoading}
      />

      <BulkLicenseModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onGenerate={handleSaveBulk}
        products={products}
      />
    </div>
  );
}
