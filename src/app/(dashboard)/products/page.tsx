"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { 
  Layers, 
  Plus, 
  Search, 
  Check, 
  X, 
  Trash2,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  isLicenseRequired: boolean;
  status: string;
  downloadUrl: string | null;
  documentationUrl: string | null;
  iconUrl: string | null;
  _count?: {
    licenses: number;
    releases: number;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("AI_TOOL");
  const [price, setPrice] = useState("");
  const [isLicenseRequired, setIsLicenseRequired] = useState(true);
  const [status, setStatus] = useState("COMING_SOON");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [documentationUrl, setDocumentationUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products || []);
      } else {
        setError(data.error || "Failed to load product catalogue.");
      }
    } catch (err) {
      setError("Network error fetching products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          category,
          price: parseFloat(price) || 0,
          isLicenseRequired,
          status,
          downloadUrl: downloadUrl || null,
          documentationUrl: documentationUrl || null,
          iconUrl: iconUrl || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsModalOpen(false);
        // Clear form
        setName("");
        setSlug("");
        setDescription("");
        setCategory("AI_TOOL");
        setPrice("");
        setIsLicenseRequired(true);
        setStatus("COMING_SOON");
        setDownloadUrl("");
        setDocumentationUrl("");
        setIconUrl("");
        // Reload list
        fetchProducts();
      } else {
        alert("Error creating product: " + data.error);
      }
    } catch (err) {
      alert("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product listing?")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProducts();
      } else {
        const data = await response.json();
        alert("Failed to delete product: " + data.error);
      }
    } catch (err) {
      alert("Error sending delete request.");
    }
  };

  // Helper to map category enum to readable format
  const formatCategory = (cat: string) => {
    return cat.replace("_", " ");
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = 
      categoryFilter === "All" || 
      p.category === categoryFilter.toUpperCase().replace(" ", "_");

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-8 text-xs relative">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">Product Catalogue</h2>
          <p className="text-xs text-muted">Manage categories, details, pricing, and license triggers.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchProducts}
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
            Create Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard hoverable={false} className="py-4 px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 border border-border bg-surface2/25 px-3 py-1.5 rounded-sm w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-muted" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, slug, description..." 
            className="bg-transparent text-xs text-foreground focus:outline-none w-full placeholder:text-muted/60"
          />
        </div>
        <div className="flex gap-2">
          {["All", "AI Tool", "Chrome Extension", "Desktop Software", "Automation", "API"].map((cat, idx) => (
            <button 
              key={idx} 
              onClick={() => setCategoryFilter(cat)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-sm border transition-all ${
                categoryFilter === cat 
                  ? "bg-surface border-border-active text-cyan" 
                  : "bg-surface2/20 border-border text-muted hover:text-foreground hover:bg-surface/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Product List Table */}
      <GlassCard className="flex flex-col gap-4">
        {loading && products.length === 0 ? (
          <div className="text-center py-8 text-muted">Loading product database...</div>
        ) : error ? (
          <div className="text-center py-8 text-red font-semibold">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-muted/60" />
            No products matching filters found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3">Slug</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Pricing</th>
                  <th className="py-3">License Key</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{p.name}</span>
                        <span className="text-[10px] text-muted max-w-xs truncate">{p.description}</span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-muted text-[11px]">{p.slug}</td>
                    <td className="py-4 text-muted uppercase text-[9px] font-bold">{formatCategory(p.category)}</td>
                    <td className="py-4 font-bold text-white">${Number(p.price).toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-sm border ${
                        p.isLicenseRequired 
                          ? "bg-cyan/5 border-cyan/10 text-cyan" 
                          : "bg-muted/5 border-border text-muted"
                      }`}>
                        {p.isLicenseRequired ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                        {p.isLicenseRequired ? "Required" : "Free"}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm border ${
                        p.status === "LIVE" 
                          ? "bg-green/10 border-green/20 text-green" 
                          : p.status === "BETA" 
                          ? "bg-violet/10 border-violet/20 text-violet" 
                          : "bg-gold/10 border-gold/20 text-gold"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-4">
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 hover:text-red border border-transparent hover:border-red/10 rounded-sm hover:bg-red/5 transition-all text-muted" 
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Modal Dialog Form for Product Creation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <GlassCard hoverable={false} className="w-full max-w-lg flex flex-col gap-5 p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="font-bricolage font-bold text-base text-white">Create New Product Listing</h3>
                <p className="text-[10px] text-muted">Register a new software catalog inside BornaLabs.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[9px] uppercase">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      // Auto slug generation
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                    }}
                    placeholder="JoyPanda Desktop"
                    className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none focus:border-border-active transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[9px] uppercase">Slug Identifier</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="joypanda-desktop"
                    className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none focus:border-border-active transition-all font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted font-bold text-[9px] uppercase">Product Description</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize product feature specifications..."
                  className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none focus:border-border-active transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[9px] uppercase">Product Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none focus:border-border-active transition-all"
                  >
                    <option value="AI_TOOL">AI Tool</option>
                    <option value="CHROME_EXTENSION">Chrome Extension</option>
                    <option value="DESKTOP_SOFTWARE">Desktop Software</option>
                    <option value="AUTOMATION">Automation Tool</option>
                    <option value="API">API Service</option>
                    <option value="FUTURE_PRODUCT">Future Product</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[9px] uppercase">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="49.00"
                    className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none focus:border-border-active transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[9px] uppercase">Telemetry Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none focus:border-border-active transition-all"
                  >
                    <option value="COMING_SOON">Coming Soon</option>
                    <option value="BETA">Beta Test Mode</option>
                    <option value="LIVE">Live Production</option>
                    <option value="DEPRECATED">Deprecated</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 justify-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-4 select-none">
                    <input
                      type="checkbox"
                      checked={isLicenseRequired}
                      onChange={(e) => setIsLicenseRequired(e.target.checked)}
                      className="rounded border-border text-cyan focus:ring-0 focus:ring-offset-0 bg-surface2"
                    />
                    <span className="text-muted font-bold text-[9px] uppercase">License Activation Required</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[9px] uppercase">Download URL (Optional)</label>
                  <input
                    type="text"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-surface2/40 border border-border rounded-sm py-2 px-3 text-foreground focus:outline-none focus:border-border-active transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted font-bold text-[9px] uppercase">Icon URL (Optional)</label>
                  <input
                    type="text"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://..."
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
                  {submitting ? "Saving Product..." : "Save Product"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
