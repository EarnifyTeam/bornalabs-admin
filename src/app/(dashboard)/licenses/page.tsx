"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { 
  Key, 
  Plus, 
  Search, 
  RefreshCw, 
  Ban, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  Monitor,
  X
} from "lucide-react";

interface Product {
  name: string;
  slug: string;
}

interface User {
  email: string;
}

interface LicenseData {
  id: string;
  licenseKey: string;
  type: string;
  prefix: string;
  status: string;
  expiryDate: string | null;
  activationDate: string | null;
  lastActiveAt: string | null;
  deviceLimit: number;
  user: User;
  product: Product;
  _count?: {
    devices: number;
  };
}

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<LicenseData[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [type, setType] = useState("TRIAL");
  const [prefix, setPrefix] = useState("BL");
  const [deviceLimit, setDeviceLimit] = useState("1");
  const [durationDays, setDurationDays] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchLicenses = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/licenses");
      const data = await response.json();
      if (response.ok) {
        setLicenses(data.licenses || []);
      } else {
        setError(data.error || "Failed to load license manager registry.");
      }
    } catch (err) {
      setError("Network error fetching licenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const handleGenerateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          productSlug,
          type,
          prefix,
          deviceLimit: parseInt(deviceLimit) || 1,
          durationDays: durationDays ? parseInt(durationDays) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsModalOpen(false);
        // Clear form
        setEmail("");
        setProductSlug("");
        setType("TRIAL");
        setPrefix("BL");
        setDeviceLimit("1");
        setDurationDays("");
        // Reload list
        fetchLicenses();
      } else {
        alert("Error generating license: " + data.error);
      }
    } catch (err) {
      alert("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (licenseId: string, status: string) => {
    try {
      const response = await fetch(`/api/licenses/${licenseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchLicenses();
      } else {
        const data = await response.json();
        alert("Failed to update status: " + data.error);
      }
    } catch (err) {
      alert("Error sending request.");
    }
  };

  const handleFlushDevices = async (licenseId: string) => {
    if (!confirm("Are you sure you want to flush all hardware devices bound to this license?")) return;

    try {
      const response = await fetch(`/api/licenses/${licenseId}/devices`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchLicenses();
        alert("All hardware devices successfully de-linked from license!");
      } else {
        const data = await response.json();
        alert("Failed to flush devices: " + data.error);
      }
    } catch (err) {
      alert("Error resetting devices.");
    }
  };

  const handleDeleteLicense = async (licenseId: string) => {
    if (!confirm("Are you sure you want to permanently delete this license key?")) return;

    try {
      const response = await fetch(`/api/licenses/${licenseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchLicenses();
      } else {
        const data = await response.json();
        alert("Failed to delete license: " + data.error);
      }
    } catch (err) {
      alert("Error sending delete request.");
    }
  };

  // Compute Stats values based on actual database list
  const totalKeys = licenses.length;
  const totalDevices = licenses.reduce((sum, item) => sum + (item._count?.devices || 0), 0);
  const totalSuspended = licenses.filter((l) => l.status === "SUSPENDED").length;

  const licenseStats = [
    { title: "Total Licenses", value: totalKeys.toLocaleString(), subtitle: "Active & Trial keys" },
    { title: "Devices Connected", value: totalDevices.toLocaleString(), subtitle: "Active system nodes" },
    { title: "Keys Suspended", value: totalSuspended.toLocaleString(), subtitle: "Blacklisted leak attempts" },
    { title: "Uptime Health", value: "99.99%", subtitle: "Telemetry validation node" },
  ];

  const filteredLicenses = licenses.filter((l) => {
    const matchesSearch = 
      l.licenseKey.toLowerCase().includes(search.toLowerCase()) ||
      l.user.email.toLowerCase().includes(search.toLowerCase()) ||
      l.product.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || l.status === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-8 text-xs relative">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">License Manager</h2>
          <p className="text-xs text-muted">Generate, renew, suspend, and monitor active client device hardware signatures.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchLicenses}
            className="flex items-center gap-2 text-xs font-bold text-white bg-surface border border-border px-4 py-2.5 rounded-sm hover:bg-surface/60 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan" : ""}`} />
            Refresh
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-tr from-cyan to-violet px-4 py-2.5 rounded-sm shadow-md hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Generate License
          </button>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {licenseStats.map((stat, i) => (
          <GlassCard key={i} hoverable={false} className="py-4 px-6 flex flex-col gap-1.5">
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">{stat.title}</span>
            <span className="text-xl font-bold font-bricolage text-white">{stat.value}</span>
            <span className="text-[9px] text-muted">{stat.subtitle}</span>
          </GlassCard>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <GlassCard hoverable={false} className="py-4 px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 border border-border bg-surface2/25 px-3 py-1.5 rounded-sm w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-muted" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search licenses by key, owner email, product..." 
            className="bg-transparent text-xs text-foreground focus:outline-none w-full placeholder:text-muted/60"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Suspended", "Expired"].map((statFilter, idx) => (
            <button 
              key={idx} 
              onClick={() => setStatusFilter(statFilter)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-sm border transition-all ${
                statusFilter === statFilter 
                  ? "bg-surface border-border-active text-cyan" 
                  : "bg-surface2/20 border-border text-muted hover:text-foreground hover:bg-surface/30"
              }`}
            >
              {statFilter}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* License table */}
      <GlassCard className="flex flex-col gap-4">
        {loading && licenses.length === 0 ? (
          <div className="text-center py-8 text-muted">Loading license database...</div>
        ) : error ? (
          <div className="text-center py-8 text-red font-semibold">{error}</div>
        ) : filteredLicenses.length === 0 ? (
          <div className="text-center py-8 text-muted">No licenses found in registry matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">License Key</th>
                  <th className="py-3">Owner Email</th>
                  <th className="py-3">Associated Product</th>
                  <th className="py-3">Plan Details</th>
                  <th className="py-3">Devices Bound</th>
                  <th className="py-3">Last Active Call</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.map((l, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                    <td className="py-4 px-4 font-mono font-bold text-cyan text-[11px]">{l.licenseKey}</td>
                    <td className="py-4 text-muted">{l.user.email}</td>
                    <td className="py-4 text-white font-semibold">{l.product.name}</td>
                    <td className="py-4 text-muted">{l.type}</td>
                    <td className="py-4 font-mono font-bold text-[11px] text-white">
                      <div className="flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-muted" />
                        {l._count?.devices || 0} / {l.deviceLimit}
                      </div>
                    </td>
                    <td className="py-4 text-muted">
                      {l.lastActiveAt ? new Date(l.lastActiveAt).toLocaleString() : "Never active"}
                    </td>
                    <td className="py-4">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm border ${
                        l.status === "ACTIVE" 
                          ? "bg-green/10 border-green/20 text-green" 
                          : l.status === "SUSPENDED" 
                          ? "bg-red/10 border-red/20 text-red" 
                          : "bg-muted/10 border-border text-muted"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex justify-end gap-2 text-muted">
                        <button 
                          onClick={() => handleFlushDevices(l.id)}
                          className="p-1 hover:text-cyan border border-transparent hover:border-cyan/10 rounded-sm hover:bg-cyan/5 transition-all" 
                          title="Reset devices (flush logs)"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        {l.status === "ACTIVE" ? (
                          <button 
                            onClick={() => handleStatusUpdate(l.id, "SUSPENDED")}
                            className="p-1 hover:text-red border border-transparent hover:border-red/10 rounded-sm hover:bg-red/5 transition-all" 
                            title="Suspend Key"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusUpdate(l.id, "ACTIVE")}
                            className="px-2 py-0.5 bg-green/10 border border-green/20 text-green rounded-sm font-bold text-[9px]" 
                            title="Reactivate Key"
                          >
                            Activate
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteLicense(l.id)}
                          className="p-1 hover:text-red border border-transparent hover:border-red/10 rounded-sm hover:bg-red/5 transition-all" 
                          title="Hard Delete Key"
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

      {/* Modal Dialog Form for License Generation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <GlassCard hoverable={false} className="w-full max-w-md flex flex-col gap-5 p-8">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="font-bricolage font-bold text-base text-white">Generate Client License Key</h3>
                <p className="text-[10px] text-muted">Provision a cryptographic key bound to a client email.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateLicense} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[9px] uppercase">Registered Customer Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@domain.com"
                  className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none focus:border-border-active transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[9px] uppercase">Target Product Slug</label>
                <input
                  type="text"
                  required
                  value={productSlug}
                  onChange={(e) => setProductSlug(e.target.value)}
                  placeholder="joypanda"
                  className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none focus:border-border-active transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[9px] uppercase">License Plan</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none focus:border-border-active transition-all"
                  >
                    <option value="FREE">Free Tier</option>
                    <option value="TRIAL">Trial Mode</option>
                    <option value="MONTHLY">Monthly Billing</option>
                    <option value="YEARLY">Yearly Billing</option>
                    <option value="LIFETIME">Lifetime Plan</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[9px] uppercase">Key Prefix</label>
                  <input
                    type="text"
                    required
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="BL"
                    maxLength={10}
                    className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none focus:border-border-active transition-all font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[9px] uppercase">Max Devices Limit</label>
                  <input
                    type="number"
                    required
                    value={deviceLimit}
                    onChange={(e) => setDeviceLimit(e.target.value)}
                    min={1}
                    className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none focus:border-border-active transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[9px] uppercase">Duration (Days - Optional)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    placeholder="30"
                    min={1}
                    className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none focus:border-border-active transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border text-muted hover:text-white rounded-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 text-white bg-gradient-to-tr from-cyan to-violet hover:opacity-90 rounded-sm font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? "Generating..." : "Generate Key"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
