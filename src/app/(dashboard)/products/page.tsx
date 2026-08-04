"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";
import { 
  Package, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { ProductModal, type ProductFormData } from "@/components/products/product-modal";

interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: string;
  isLicenseRequired: boolean;
  status: "LIVE" | "BETA" | "COMING_SOON" | "DEPRECATED";
  downloadUrl: string | null;
  documentationUrl: string | null;
  iconUrl: string | null;
  _count?: {
    licenses: number;
    releases: number;
  };
}

export default function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/api/products";
      if (selectedCategory !== "ALL") {
        url += `?category=${selectedCategory}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      } else {
        setError(data.error || "Failed to load products database records.");
      }
    } catch (err) {
      setError("Network error connecting to products API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: ProductRecord) => {
    setEditingProduct({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      category: p.category,
      price: String(p.price),
      status: p.status,
      isLicenseRequired: p.isLicenseRequired,
      downloadUrl: p.downloadUrl || "",
      documentationUrl: p.documentationUrl || "",
      iconUrl: p.iconUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (formData: ProductFormData) => {
    setModalLoading(true);
    try {
      const isEditing = !!formData.id;
      const url = isEditing ? `/api/products/${formData.id}` : "/api/products";
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price || "0"),
        status: formData.status,
        isLicenseRequired: formData.isLicenseRequired,
        downloadUrl: formData.downloadUrl || null,
        documentationUrl: formData.documentationUrl || null,
        iconUrl: formData.iconUrl || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Product ${isEditing ? "updated" : "created"} successfully!`);
        setIsModalOpen(false);
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to save product listing.");
      }
    } catch (err) {
      toast.error("Error saving product data.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`Product "${name}" deleted successfully.`);
        fetchProducts();
      } else {
        toast.error("Failed to delete product record.");
      }
    } catch (err) {
      toast.error("Network error deleting product.");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    return matchesSearch;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "LIVE": return "active";
      case "BETA": return "info";
      case "COMING_SOON": return "warning";
      case "DEPRECATED": return "danger";
      default: return "neutral";
    }
  };

  return (
    <div className="flex flex-col gap-8 text-xs">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight text-white">Products Catalog</h2>
          <p className="text-xs text-muted">Manage software products, pricing, and category distribution in Supabase database.</p>
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
            onClick={handleOpenCreateModal}
          >
            New Product
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard hoverable={false} className="py-4 px-6 flex items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search products by title, slug, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-muted" />}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["ALL", "AI_TOOL", "CHROME_EXTENSION", "DESKTOP_SOFTWARE", "AUTOMATION", "API"].map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-sm border transition-all ${
                selectedCategory === cat
                  ? "bg-surface border-border-active text-cyan"
                  : "bg-surface2/20 border-border text-muted hover:text-foreground"
              }`}
            >
              {cat.replace("_", " ")}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Products Data Table */}
      <GlassCard className="flex flex-col gap-4">
        {loading && products.length === 0 ? (
          <div className="text-center py-12 text-muted">Loading software products catalog...</div>
        ) : error ? (
          <div className="text-center py-12 text-red font-semibold">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted flex flex-col items-center justify-center gap-2">
            <Package className="w-8 h-8 text-muted/50" />
            <span>No products matching current filter criteria.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Software Name</th>
                  <th className="py-3">Slug</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Price ($)</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">License Required</th>
                  <th className="py-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                    <td className="py-4 px-4 font-bold text-white">
                      <div className="flex flex-col">
                        <span>{p.name}</span>
                        {p.description && (
                          <span className="text-[10px] text-muted max-w-xs truncate font-normal">
                            {p.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 font-mono text-cyan text-[11px]">{p.slug}</td>
                    <td className="py-4 text-violet font-semibold text-[10px]">
                      {p.category.replace("_", " ")}
                    </td>
                    <td className="py-4 font-bold text-white">${Number(p.price).toFixed(2)}</td>
                    <td className="py-4">
                      <Badge variant={getStatusBadgeVariant(p.status)}>{p.status}</Badge>
                    </td>
                    <td className="py-4">
                      {p.isLicenseRequired ? (
                        <span className="text-green text-[10px] font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-muted text-[10px]">No</span>
                      )}
                    </td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex justify-end gap-2 text-muted">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1 hover:text-cyan transition-all"
                          title="Edit Product Listing"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1 hover:text-red transition-all"
                          title="Delete Product"
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

      {/* Modal Dialog */}
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
