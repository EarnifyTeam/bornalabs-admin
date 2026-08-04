import prisma from "@/lib/prisma";

export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  category: string;
  productType: string;
  version: string;
  price: number;
  isLicenseRequired: boolean;
  status: string;
  downloadUrl: string | null;
  documentationUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  iconUrl: string | null;
  bannerUrl: string | null;
  galleryImages: string[];
  featured: boolean;
  createdAt: string;
  releases?: Array<{
    id: string;
    version: string;
    fileName: string | null;
    fileUrl: string;
    platform: string;
    fileType: string;
    isLatest: boolean;
  }>;
}

/**
 * Public Query Helper: Excludes DRAFT and soft-deleted items
 */
const publicWhereBase = {
  deletedAt: null,
  status: {
    not: "DRAFT" as const,
  },
};

/**
 * Get Featured Products for Home Page
 */
export async function getFeaturedProducts(limit = 6): Promise<PublicProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        ...publicWhereBase,
        featured: true,
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      createdAt: p.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("getFeaturedProducts Error:", error);
    return [];
  }
}

/**
 * Get Latest Released Products
 */
export async function getLatestProducts(limit = 8): Promise<PublicProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        ...publicWhereBase,
        status: { in: ["LIVE", "BETA"] },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      createdAt: p.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("getLatestProducts Error:", error);
    return [];
  }
}

/**
 * Get Coming Soon Products Showcase
 */
export async function getComingSoonProducts(limit = 6): Promise<PublicProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        ...publicWhereBase,
        status: "COMING_SOON",
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      createdAt: p.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("getComingSoonProducts Error:", error);
    return [];
  }
}

/**
 * Get Single Product Details by Unique Slug
 */
export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  try {
    const product = await prisma.product.findFirst({
      where: {
        ...publicWhereBase,
        slug,
      },
      include: {
        releases: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!product) return null;

    return {
      ...product,
      price: Number(product.price),
      createdAt: product.createdAt.toISOString(),
      releases: product.releases.map((r) => ({
        id: r.id,
        version: r.version,
        fileName: r.fileName,
        fileUrl: r.fileUrl,
        platform: r.platform,
        fileType: r.fileType,
        isLatest: r.isLatest,
      })),
    };
  } catch (error) {
    console.error(`getProductBySlug(${slug}) Error:`, error);
    return null;
  }
}

/**
 * Search & Filter Public Products
 */
export async function getPublicProducts(params: {
  search?: string;
  category?: string;
  productType?: string;
  status?: string;
  limit?: number;
}): Promise<PublicProduct[]> {
  try {
    const where: any = { ...publicWhereBase };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { shortDescription: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.category && params.category !== "ALL") {
      where.category = params.category;
    }

    if (params.productType && params.productType !== "ALL") {
      where.productType = params.productType;
    }

    if (params.status && params.status !== "ALL") {
      where.status = params.status;
    }

    const products = await prisma.product.findMany({
      where,
      take: params.limit || 20,
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      createdAt: p.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("getPublicProducts Error:", error);
    return [];
  }
}
