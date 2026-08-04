import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ProductCategory, ProductStatus } from "@prisma/client";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * GET: Search, filter (category, productType, status, trash), sort, and paginate products
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const productType = searchParams.get("productType");
    const status = searchParams.get("status");
    const trash = searchParams.get("trash") === "true"; // soft deleted tab
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (trash) {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "ALL") {
      where.category = category as ProductCategory;
    }

    if (productType && productType !== "ALL") {
      where.productType = productType as ProductCategory;
    }

    if (status && status !== "ALL") {
      where.status = status as ProductStatus;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/products Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new product with auto-generated unique slug
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug: customSlug,
      shortDescription,
      description,
      category,
      productType,
      version,
      price,
      status,
      isLicenseRequired,
      featured,
      iconUrl,
      bannerUrl,
      galleryImages,
      downloadUrl,
      documentationUrl,
      githubUrl,
      websiteUrl,
    } = body;

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: "MISSING_REQUIRED_FIELDS", message: "Product Name, Description, and Category are required." },
        { status: 400 }
      );
    }

    let slug = customSlug ? generateSlug(customSlug) : generateSlug(name);
    let existingSlug = await prisma.product.findUnique({ where: { slug } });
    let counter = 1;
    while (existingSlug) {
      slug = `${generateSlug(name)}-${counter}`;
      existingSlug = await prisma.product.findUnique({ where: { slug } });
      counter++;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        shortDescription: shortDescription || null,
        description,
        category: category as ProductCategory,
        productType: (productType || category) as ProductCategory,
        version: version || "1.0.0",
        price: parseFloat(price || "0"),
        status: (status || "COMING_SOON") as ProductStatus,
        isLicenseRequired: isLicenseRequired ?? true,
        featured: featured ?? false,
        iconUrl: iconUrl || null,
        bannerUrl: bannerUrl || null,
        galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
        downloadUrl: downloadUrl || null,
        documentationUrl: documentationUrl || null,
        githubUrl: githubUrl || null,
        websiteUrl: websiteUrl || null,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/products Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
