"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Copy, 
  RotateCcw, 
  RefreshCw, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  CheckCircle2
} from "lucide-react";
import { ProductModal, type ProductFormData } from "@/components/products/product-modal";

interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description: string;
  category: string;
  productType: string;
  version: string;
  price: string | number;
  status: string;
  isLicenseRequired: boolean;
  featured: boolean;
  iconUrl?: string | null;
  bannerUrl?: string | null;
  galleryImages?: string[];
  downloadUrl?: string | null;
  documentationUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [viewTrash, setViewTrash] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams({
        search,
        category: selectedCategory,
        productType: selectedType,
        status: selectedStatus,
        trash: viewTrash ? "true" : "false",
        page: page.toString(),
        limit: "8",
      });

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setProducts(data.products || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      } else {
        setError(data.message || "Failed to load products.");
      }
    } catch (err) {
      setError("Error connecting to Products API endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, selectedType, selectedStatus, viewTrash, page]);

  const handleCreateNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (prod: ProductRecord) => {
    setEditingProduct({
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      shortDescription: prod.shortDescription || "",
      description: prod.description,
      category: prod.category,
      productType: prod.productType || prod.category,
      version: prod.version || "1.0.0",
      price: prod.price?.toString() || "0.00",
      status: prod.status,
      isLicenseRequired: prod.isLicenseRequired ?? true,
      featured: prod.featured ?? false,
      iconUrl: prod.iconUrl || "",
      bannerUrl: prod.bannerUrl || "",
      galleryImages: prod.galleryImages || [],
      downloadUrl: prod.downloadUrl || "",
      documentationUrl: prod.documentationUrl || "",
      githubUrl: prod.githubUrl || "",
      websiteUrl: prod.websiteUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (formData: ProductFormData) => {
    setModalLoading(true);
    try {
      const isEdit = !!formData.id;
      const url = isEdit ? `/api/products/${formData.id}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Product "${formData.name}" ${isEdit ? "updated" : "published"} successfully!`);
        setIsModalOpen(false);
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to save product.");
      }
    } catch (err) {
      toast.error("Error connecting to Product API.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleSoftDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to send "${name}" to Trash?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Product "${name}" moved to Trash.`);
        fetchProducts();
      } else {
        toast.error("Failed to delete product.");
      }
    } catch (err) {
      toast.error("Error deleting product.");
    }
  };

  const handleRestore = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/products/${id}/restore`, { method: "POST" });
      if (res.ok) {
        toast.success(`Product "${name}" restored successfully!`);
        fetchProducts();
      } else {
        toast.error("Failed to restore product.");
      }
    } catch (err) {
      toast.error("Error restoring product.");
    }
  };

  const handleDuplicate = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/products/${id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Product "${name}" duplicated as draft!`);
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to duplicate product.");
      }
    } catch (err) {
      toast.error("Error duplicating product.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIVE":
        return <Badge variant="active">LIVE</Badge>;
      case "BETA":
        return <Badge variant="info">BETA</Badge>;
      case "COMING_SOON":
        return <Badge variant="warning">COMING SOON</Badge>;
      case "DRAFT":
        return <Badge variant="neutral">DRAFT</Badge>;
      case "DEPRECATED":
        return <Badge variant="danger">DEPRECATED</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">Product Management</h2>
          <p className="text-xs text-muted">Manage BornaLabs AI Tools, Extensions, Desktop Software & APIs in Supabase DB.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan" : ""}`} />}
            onClick={fetchProducts}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleCreateNew}
          >
            Add New Product
          </Button>
        </div>
      </div>

      {/* Filter Bar & Tabs */}
      <GlassCard className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          {/* Active vs Trash View Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => { setViewTrash(false); setPage(1); }}
              className={`px-4 py-1.5 rounded-sm font-bold text-xs transition-all ${
                !viewTrash
                  ? "bg-surface border border-cyan/40 text-cyan shadow-sm"
                  : "bg-surface2/20 text-muted hover:text-white"
              }`}
            >
              Active Products ({!viewTrash ? totalCount : "•"})
            </button>
            <button
              onClick={() => { setViewTrash(true); setPage(1); }}
              className={`px-4 py-1.5 rounded-sm font-bold text-xs transition-all ${
                viewTrash
                  ? "bg-surface border border-red/40 text-red shadow-sm"
                  : "bg-surface2/20 text-muted hover:text-white"
              }`}
            >
              Trash ({viewTrash ? totalCount : "•"})
            </button>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-64 relative">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search className="w-3.5 h-3.5 text-muted" />}
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <label className="text-muted font-bold text-[10px] uppercase shrink-0">Product Type:</label>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
              className="bg-surface2/40 border border-border rounded-sm py-1.5 px-3 text-foreground text-xs focus:outline-none w-full"
            >
              <option value="ALL">All Product Types</option>
              <option value="AI_TOOL">AI Tool</option>
              <option value="CHROME_EXTENSION">Chrome Extension</option>
              <option value="DESKTOP_SOFTWARE">Desktop Software</option>
              <option value="WEB_APPLICATION">Web Application</option>
              <option value="AUTOMATION">Automation Tool</option>
              <option value="API">API Service</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-muted font-bold text-[10px] uppercase shrink-0">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="bg-surface2/40 border border-border rounded-sm py-1.5 px-3 text-foreground text-xs focus:outline-none w-full"
            >
              <option value="ALL">All Categories</option>
              <option value="AI_TOOL">AI Tool</option>
              <option value="CHROME_EXTENSION">Chrome Extension</option>
              <option value="DESKTOP_SOFTWARE">Desktop Software</option>
              <option value="WEB_APPLICATION">Web Application</option>
              <option value="AUTOMATION">Automation Tool</option>
              <option value="API">API Service</option>
              <option value="FUTURE_PRODUCT">Future Product</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-muted font-bold text-[10px] uppercase shrink-0">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="bg-surface2/40 border border-border rounded-sm py-1.5 px-3 text-foreground text-xs focus:outline-none w-full"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="COMING_SOON">Coming Soon</option>
              <option value="BETA">Beta</option>
              <option value="LIVE">Live</option>
              <option value="DEPRECATED">Deprecated</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Products Table */}
      <GlassCard className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-16 text-muted">Loading products list...</div>
        ) : error ? (
          <div className="text-center py-16 text-red font-semibold">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted flex flex-col items-center justify-center gap-2">
            <Package className="w-8 h-8 text-muted/50" />
            <span>No products found matching query.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Version</th>
                  <th className="py-3">Price</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                    <td className="py-4 px-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface2/60 border border-border flex items-center justify-center shrink-0 overflow-hidden">
                          {prod.iconUrl ? (
                            <img src={prod.iconUrl} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-4 h-4 text-cyan" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span>{prod.name}</span>
                            {prod.featured && (
                              <span className="text-[8px] font-bold px-1.5 py-0.2 bg-gold/10 text-gold border border-gold/20 rounded-sm">
                                FEATURED
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted font-mono font-normal">/{prod.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-foreground text-[11px]">{prod.category}</td>
                    <td className="py-4 font-semibold text-cyan text-[11px]">{prod.productType || prod.category}</td>
                    <td className="py-4 font-mono text-muted text-[11px]">{prod.version || "1.0.0"}</td>
                    <td className="py-4 font-mono font-bold text-white text-[11px]">
                      ${parseFloat(prod.price?.toString() || "0").toFixed(2)}
                    </td>
                    <td className="py-4">{getStatusBadge(prod.status)}</td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex justify-end items-center gap-2">
                        {!viewTrash ? (
                          <>
                            <button
                              onClick={() => handleEdit(prod)}
                              className="p-1 hover:text-cyan transition-all text-muted"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(prod.id, prod.name)}
                              className="p-1 hover:text-gold transition-all text-muted"
                              title="Duplicate Product"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSoftDelete(prod.id, prod.name)}
                              className="p-1 hover:text-red transition-all text-muted"
                              title="Move to Trash"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(prod.id, prod.name)}
                            className="p-1 hover:text-green transition-all text-muted flex items-center gap-1 font-bold text-[10px]"
                            title="Restore Product"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                        )}
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
              Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span> ({totalCount} total products)
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

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
        loading={modalLoading}
      />
    </div>
  );
}
