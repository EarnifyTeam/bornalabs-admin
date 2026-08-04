import { GlassCard } from "@/components/glass-card";
import { 
  Layers, 
  Plus, 
  Search, 
  ExternalLink, 
  Check, 
  X, 
  MoreVertical,
  Eye,
  Archive,
  Copy,
  Trash2
} from "lucide-react";

export default function ProductsPage() {
  const products = [
    { id: "p1", name: "JoyPanda", slug: "joypanda", category: "Desktop Software", price: "$49.00", license: true, status: "LIVE", version: "v2.4.1", description: "Bulk media asset downloader for creators." },
    { id: "p2", name: "ClipPanda", slug: "clippanda", category: "AI Tools", price: "$99.00/mo", license: true, status: "BETA", version: "v1.2.0-beta", description: "AI video short clipper and subtitler." },
    { id: "p3", name: "ProxyPanda", slug: "proxypanda", category: "API", price: "$199.00", license: true, status: "LIVE", version: "v3.1.0", description: "System network proxy interceptor." },
    { id: "p4", name: "GlitchPanda", slug: "glitchpanda", category: "Automation", price: "$0.00", license: false, status: "LIVE", version: "v1.8.5", description: "GPU video batch processor script." },
    { id: "p5", name: "SEO Panda Extractor", slug: "seo-panda", category: "Chrome Extension", price: "$29.00", license: true, status: "COMING_SOON", version: "v0.9.0", description: "SEO metadata browser scraping scraper." },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bricolage font-bold text-2xl tracking-tight">Product Catalogue</h2>
          <p className="text-xs text-muted">Manage categories, details, pricing, and license triggers.</p>
        </div>
        <button className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-tr from-cyan to-violet px-4 py-2.5 rounded-sm shadow-md hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" />
          Create Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard hoverable={false} className="py-4 px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 border border-border bg-surface2/25 px-3 py-1.5 rounded-sm w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-muted" />
          <input 
            type="text" 
            placeholder="Search products by title, slug, version..." 
            className="bg-transparent text-xs text-foreground focus:outline-none w-full placeholder:text-muted/60"
          />
        </div>
        <div className="flex gap-2">
          {["All", "AI Tools", "Chrome Extension", "Desktop Software", "Automation", "API"].map((cat, idx) => (
            <button 
              key={idx} 
              className={`text-[10px] font-bold px-3 py-1.5 rounded-sm border transition-all ${
                idx === 0 
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-muted font-bold text-[10px] uppercase tracking-wider">
                <th className="py-3">Name</th>
                <th className="py-3">Slug</th>
                <th className="py-3">Category</th>
                <th className="py-3">Pricing</th>
                <th className="py-3">License Key</th>
                <th className="py-3">Current Release</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface/20 transition-all">
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{p.name}</span>
                      <span className="text-[10px] text-muted max-w-xs truncate">{p.description}</span>
                    </div>
                  </td>
                  <td className="py-4 font-mono text-muted text-[11px]">{p.slug}</td>
                  <td className="py-4 text-muted">{p.category}</td>
                  <td className="py-4 font-bold">{p.price}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-sm border ${
                      p.license 
                        ? "bg-cyan/5 border-cyan/10 text-cyan" 
                        : "bg-muted/5 border-border text-muted"
                    }`}>
                      {p.license ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                      {p.license ? "Required" : "Free"}
                    </span>
                  </td>
                  <td className="py-4 font-mono font-bold text-violet text-[10px]">{p.version}</td>
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
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2 text-muted">
                      <button className="p-1 hover:text-foreground transition-all" title="View details"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1 hover:text-foreground transition-all" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                      <button className="p-1 hover:text-foreground transition-all" title="Archive"><Archive className="w-3.5 h-3.5" /></button>
                      <button className="p-1 hover:text-red transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
