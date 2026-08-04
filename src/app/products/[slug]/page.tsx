import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/public-products";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  ExternalLink, 
  Github, 
  Globe, 
  FileText, 
  Key, 
  ShieldCheck, 
  Tag, 
  Layers,
  ArrowLeft
} from "lucide-react";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

/**
 * Dynamic SEO Metadata Generator for Product Page
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product Not Found | BornaLabs",
      description: "The requested BornaLabs product could not be found.",
    };
  }

  const title = `${product.name} v${product.version} | BornaLabs`;
  const description = product.shortDescription || product.description.slice(0, 160);
  const images = product.iconUrl ? [product.iconUrl] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // JSON-LD Structured Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    operatingSystem: "Windows, macOS, Linux, Chrome",
    applicationCategory: product.category,
    softwareVersion: product.version,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-cyan transition-colors font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products Catalogue</span>
        </Link>
      </div>

      {/* Product Banner & Hero Header */}
      <GlassCard className="flex flex-col gap-6 p-6 md:p-8 relative overflow-hidden">
        {product.bannerUrl && (
          <div className="absolute inset-0 z-0 opacity-10">
            <img src={product.bannerUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            {product.iconUrl ? (
              <img
                src={product.iconUrl}
                alt={product.name}
                className="w-16 h-16 rounded-xl object-cover border border-cyan/30 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-cyan/30 to-violet/30 border border-cyan/40 flex items-center justify-center font-bold text-cyan font-bricolage text-2xl">
                {product.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bricolage font-bold text-2xl md:text-3xl text-white tracking-tight">
                  {product.name}
                </h1>
                <Badge variant={product.status === "LIVE" ? "active" : "warning"}>
                  {product.status}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted mt-1 font-mono">
                <span>Version {product.version}</span>
                <span>•</span>
                <span className="text-cyan font-bold">{product.category.replace("_", " ")}</span>
              </div>
            </div>
          </div>

          {/* Download & License CTA */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {product.status === "COMING_SOON" ? (
              <span className="w-full md:w-auto text-center px-6 py-3 rounded-sm bg-gold/20 border border-gold/40 text-gold font-bold text-xs uppercase tracking-wider">
                Coming Soon
              </span>
            ) : product.downloadUrl && !product.isLicenseRequired ? (
              <a
                href={product.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-sm bg-cyan text-black font-bold text-xs hover:bg-cyan/90 transition-all shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Download Now (v{product.version})</span>
              </a>
            ) : (
              <div className="w-full md:w-auto flex flex-col gap-1 items-end">
                <span className="px-5 py-2.5 rounded-sm bg-violet/20 border border-violet/40 text-violet font-bold text-xs flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  <span>License Key Required</span>
                </span>
                <span className="text-[10px] text-muted">Purchase or enter license key to activate</span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Main Grid: Description & Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Description & Screenshots */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <GlassCard className="p-6 flex flex-col gap-4">
            <h2 className="font-bricolage font-bold text-lg text-white border-b border-border pb-3">
              Overview
            </h2>
            <div className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {product.description}
            </div>
          </GlassCard>

          {/* Screenshots Gallery */}
          {product.galleryImages && product.galleryImages.length > 0 && (
            <GlassCard className="p-6 flex flex-col gap-4">
              <h2 className="font-bricolage font-bold text-lg text-white border-b border-border pb-3">
                Screenshots & Preview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.galleryImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.name} screenshot ${idx + 1}`}
                    className="w-full h-40 object-cover rounded-md border border-border hover:border-cyan/40 transition-all"
                  />
                ))}
              </div>
            </GlassCard>
          )}

          {/* Releases Timeline */}
          {product.releases && product.releases.length > 0 && (
            <GlassCard className="p-6 flex flex-col gap-4">
              <h2 className="font-bricolage font-bold text-lg text-white border-b border-border pb-3">
                Version Release History
              </h2>
              <div className="flex flex-col gap-3 text-xs">
                {product.releases.map((rel) => (
                  <div
                    key={rel.id}
                    className="p-3 bg-surface2/30 border border-border rounded-sm flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-cyan">v{rel.version}</span>
                      {rel.isLatest && <Badge variant="active" className="text-[9px]">LATEST</Badge>}
                      <span className="text-muted text-[10px]">({rel.platform})</span>
                    </div>

                    <a
                      href={rel.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan hover:underline font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>Get Package</span>
                      <Download className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Column: Metadata Sidebar */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 flex flex-col gap-4">
            <h3 className="font-bricolage font-bold text-base text-white border-b border-border pb-3">
              Software Specifications
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted font-bold text-[10px] uppercase">Pricing</span>
                <span className="font-bold text-white">
                  {product.price === 0 ? "Free Software" : `$${product.price}`}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted font-bold text-[10px] uppercase">Category</span>
                <span className="text-cyan font-bold">{product.category.replace("_", " ")}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted font-bold text-[10px] uppercase">License Control</span>
                <span className="text-foreground">
                  {product.isLicenseRequired ? "License Required" : "Open Access"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted font-bold text-[10px] uppercase">Latest Version</span>
                <span className="font-mono text-cyan font-bold">{product.version}</span>
              </div>
            </div>

            {/* Links Section */}
            <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
              {product.documentationUrl && (
                <a
                  href={product.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-sm bg-surface2/40 hover:bg-surface2/80 text-foreground text-xs font-bold transition-all"
                >
                  <FileText className="w-4 h-4 text-cyan" />
                  <span>Documentation</span>
                </a>
              )}

              {product.githubUrl && (
                <a
                  href={product.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-sm bg-surface2/40 hover:bg-surface2/80 text-foreground text-xs font-bold transition-all"
                >
                  <Github className="w-4 h-4 text-white" />
                  <span>GitHub Repository</span>
                </a>
              )}

              {product.websiteUrl && (
                <a
                  href={product.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-sm bg-surface2/40 hover:bg-surface2/80 text-foreground text-xs font-bold transition-all"
                >
                  <Globe className="w-4 h-4 text-violet" />
                  <span>Official Website</span>
                </a>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
