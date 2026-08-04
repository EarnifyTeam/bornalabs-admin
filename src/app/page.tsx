import React from "react";
import Link from "next/link";
import { 
  getFeaturedProducts, 
  getLatestProducts, 
  getComingSoonProducts 
} from "@/lib/public-products";
import { ProductCard } from "@/components/public/product-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Sparkles, ArrowRight, Package, Clock, ShieldCheck, Cpu } from "lucide-react";

export default async function PublicHomePage() {
  const [featuredProducts, latestProducts, comingSoonProducts] = await Promise.all([
    getFeaturedProducts(6),
    getLatestProducts(8),
    getComingSoonProducts(6),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col gap-12 p-4 md:p-8 max-w-6xl mx-auto">
      {/* Public Header Banner */}
      <header className="flex justify-between items-center border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan via-violet to-magenta flex items-center justify-center font-bold text-white font-bricolage text-base shadow-lg">
            B
          </div>
          <div className="flex flex-col">
            <span className="font-bricolage font-bold text-base text-white tracking-wider">BornaLabs</span>
            <span className="text-[10px] text-cyan font-mono font-semibold">Public Software Catalogue</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-sm bg-surface2/40 border border-border text-foreground hover:text-cyan hover:border-cyan/40 text-xs font-bold transition-all"
          >
            Admin Portal
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <GlassCard className="flex flex-col gap-4 p-8 md:p-12 relative overflow-hidden text-center items-center">
        <div className="w-12 h-12 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="font-bricolage font-bold text-3xl md:text-5xl text-white tracking-tight max-w-2xl">
          Next-Gen AI Tools, Extensions & Software
        </h1>
        <p className="text-muted text-xs md:text-sm max-w-xl leading-relaxed">
          Discover high-performance Chrome extensions, PromptX AI suites, and desktop applications built by BornaLabs.
        </p>
      </GlassCard>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan" />
              <h2 className="font-bricolage font-bold text-xl text-white tracking-tight">Featured Products</h2>
            </div>
            <span className="text-xs text-muted font-mono">{featuredProducts.length} Featured</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Released Products Section */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-green" />
            <h2 className="font-bricolage font-bold text-xl text-white tracking-tight">Latest Software Releases</h2>
          </div>
          <span className="text-xs text-muted font-mono">{latestProducts.length} Releases</span>
        </div>

        {latestProducts.length === 0 ? (
          <GlassCard className="text-center py-12 text-muted">
            No live software products published yet.
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Coming Soon Showcase Section */}
      {comingSoonProducts.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" />
              <h2 className="font-bricolage font-bold text-xl text-white tracking-tight">Coming Soon Showcase</h2>
            </div>
            <span className="text-xs text-muted font-mono">{comingSoonProducts.length} Upcoming</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {comingSoonProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/60 pt-6 pb-8 text-center text-muted text-xs flex flex-col items-center gap-2">
        <p>© 2026 BornaLabs Technologies. All rights reserved.</p>
        <span className="text-[10px] font-mono text-cyan">Connected to Supabase DB & Storage</span>
      </footer>
    </div>
  );
}
