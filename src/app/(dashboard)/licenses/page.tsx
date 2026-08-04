"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";
import { 
  Key, 
  Search, 
  Plus, 
  Layers, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  Copy, 
  Smartphone, 
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { LicenseModal, type LicenseFormData } from "@/components/licenses/license-modal";
import { BulkLicenseModal } from "@/components/licenses/bulk-license-modal";

interface LicenseRecord {
  id: string;
  licenseKey: string;
  prefix: string;
  type: string;
  status: "ACTIVE" | "SUSPENDED" | "BLACKLISTED" | "EXPIRED";
  deviceLimit: number;
  expiryDate: string | null;
  activationDate: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  user: {
    email: string;
    profile?: { fullName: string } | null;
  };
  product: {
    id: string;
    name: string;
    slug: string;
  };
  devices: any[];
  _count?: {
    devices: number;
  };
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
}

export default function LicensesPage() {
  const toast = useToast();
  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [error, setError] = useState("");

  // Modals state
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<LicenseFormData | null>(null);
  const [singleModalLoading, setSingleModalLoading] = useState(false);

  const fetchLicenses = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/api/licenses";
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setLicenses(data.licenses || []);
      } else {
        setError(data.error || "Failed to load licenses data.");
      }
    } catch (err) {
      setError("Network error connecting to licenses API.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to load products for dropdown:", err);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  useEffect(() => {
    fetchLicenses();
  }, [statusFilter, typeFilter]);

  const handleOpenCreateSingleModal = () => {
    setEditingLicense(null);
    setIsSingleModalOpen(true);
  };

  const handleOpenEditSingleModal = (lic: LicenseRecord) => {
    setEditingLicense({
      id: lic.id,
      email: lic.user.email,
      productId: lic.product.id,
      type: lic.type,
      prefix: lic.prefix,
      deviceLimit: lic.deviceLimit,
      durationDays: lic.expiryDate
        ? String(Math.ceil((new Date(lic.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : "",
      customKey: lic.licenseKey,
      isAutoKey: false,
      status: lic.status,
    });
    setIsSingleModalOpen(true);
  };

  const handleSaveSingleLicense = async (formData: LicenseFormData) => {
    setSingleModalLoading(true);
    try {
      const isEditing = !!formData.id;
      const url = isEditing ? `/api/licenses/${formData.id}` : "/api/licenses";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`License ${isEditing ? "updated" : "created"} successfully!`);
        setIsSingleModalOpen(false);
        fetchLicenses();
      } else {
        toast.error(data.error || "Failed to save license configuration.");
      }
    } catch (err) {
      toast.error("Error saving license data.");
    } finally {
      setSingleModalLoading(false);
    }
  };

  const handleGenerateBulkLicenses = async (bulkParams: any) => {
    try {
      const res = await fetch("/api/licenses/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bulkParams),
      });

      const data = await res.json();

      if (res.ok && data.licenses) {
        fetchLicenses();
        return data.licenses;
      } else {
        toast.error(data.error || "Failed to generate bulk licenses.");
        return null;
      }
    } catch (err) {
      toast.error("Error connecting to bulk license generation API.");
      return null;
    }
  };

  const handleResetDevices = async (licenseId: string, key: string) => {
    if (!confirm(`Reset registered hardware devices bound to license "${key}"?`)) return;

    try {
      const res = await fetch(`/api/licenses/${licenseId}/devices`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Bound hardware devices cleared successfully.");
        fetchLicenses();
      } else {
        toast.error("Failed to reset devices.");
      }
    } catch (err) {
      toast.error("Network error resetting devices.");
    }
  };

  const handleDeleteLicense = async (licenseId: string, key: string) => {
    if (!confirm(`Are you sure you want to revoke/delete license "${key}"?`)) return;

    try {
      const res = await fetch(`/api/licenses/${licenseId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("License revoked and deleted.");
        fetchLicenses();
      } else {
        toast.error("Failed to delete license.");
      }
    } catch (err) {
      toast.error("Error deleting license.");
    }
  };

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success(`License key ${key} copied to clipboard!`);
  };

  const filteredLicenses = licenses.filter((lic) => {
    const keyMatch = lic.licenseKey.toLowerCase().includes(search.toLowerCase());
    const userMatch = lic.user.email.toLowerCase().includes(search.toLowerCase());
    const prodMatch = lic.product.name.toLowerCase().includes(search.toLowerCase());
    return keyMatch || userMatch || prodMatch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE": return "active";
      case "SUSPENDED": return "warning";
      case "BLACKLISTED": return "danger";
      case "EXPIRED": return "neutral";
      default: return "neutral";
    }
  };

  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">Licenses Telemetry</h2>
          <p className="text-xs text-muted">Provision, monitor, and revoke client software keys and device limits in Supabase DB.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan" : ""}`} />}
            onClick={fetchLicenses}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Layers className="w-3.5 h-3.5" />}
            onClick={() => setIsBulkModalOpen(true)}
          >
            Bulk License
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleOpenCreateSingleModal}
          >
            Issue License
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard hoverable={false} className="py-4 px-6 flex items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search licenses by key, customer email, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-muted" />}
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "ACTIVE", "SUSPENDED", "BLACKLISTED", "EXPIRED"].map((status, idx) => (
            <button
              key={idx}
              onClick={() => setStatusFilter(status)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-sm border transition-all ${
                statusFilter === status
                  ? "bg-surface border-border-active text-violet"
                  : "bg-surface2/20 border-border text-muted hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Licenses Data Table */}
      <GlassCard className="flex flex-col gap-4">
        {loading && licenses.length === 0 ? (
          <div className="text-center py-12 text-muted">Loading active licenses database...</div>
        ) : error ? (
          <div className="text-center py-12 text-red font-semibold">{error}</div>
        ) : filteredLicenses.length === 0 ? (
          <div className="text-center py-12 text-muted flex flex-col items-center justify-center gap-2">
            <Key className="w-8 h-8 text-muted/50" />
            <span>No license keys matching current filter criteria.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">License Key</th>
                  <th className="py-3">Customer Email</th>
                  <th className="py-3">Product Name</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Devices Bound</th>
                  <th className="py-3">Expiry Date</th>
                  <th className="py-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.map((lic, idx) => {
                  const deviceCount = lic.devices ? lic.devices.length : lic._count?.devices || 0;
                  return (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                      <td className="py-4 px-4 font-mono font-bold text-cyan text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span>{lic.licenseKey}</span>
                          <button
                            onClick={() => copyLicenseKey(lic.licenseKey)}
                            className="p-1 text-muted hover:text-white transition-all"
                            title="Copy Key"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 text-white font-semibold">{lic.user?.email || "Unknown User"}</td>
                      <td className="py-4 text-violet font-semibold">{lic.product?.name || "Product"}</td>
                      <td className="py-4 font-bold text-[10px] text-muted">{lic.type}</td>
                      <td className="py-4">
                        <Badge variant={getStatusVariant(lic.status)}>{lic.status}</Badge>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <Smartphone className="w-3.5 h-3.5 text-muted" />
                          <span className={deviceCount >= lic.deviceLimit ? "text-gold font-bold" : "text-foreground"}>
                            {deviceCount} / {lic.deviceLimit}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-muted text-[10px]">
                        {lic.expiryDate ? new Date(lic.expiryDate).toLocaleDateString() : "Lifetime"}
                      </td>
                      <td className="py-4 text-right pr-4">
                        <div className="flex justify-end gap-2 text-muted">
                          <button
                            onClick={() => handleResetDevices(lic.id, lic.licenseKey)}
                            className="p-1 hover:text-gold transition-all"
                            title="Reset Bound Hardware Devices"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditSingleModal(lic)}
                            className="p-1 hover:text-cyan transition-all"
                            title="Edit License Configuration"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLicense(lic.id, lic.licenseKey)}
                            className="p-1 hover:text-red transition-all"
                            title="Revoke License"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Manual / Single License Modal */}
      <LicenseModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        onSave={handleSaveSingleLicense}
        products={products}
        initialData={editingLicense}
        loading={singleModalLoading}
      />

      {/* Bulk License Modal */}
      <BulkLicenseModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        products={products}
        onGenerate={handleGenerateBulkLicenses}
      />
    </div>
  );
}
