import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * POST: Duplicate existing product into a new draft with unique slug
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
    }

    const newName = `${existing.name} (Copy)`;
    let newSlug = generateSlug(newName);

    let slugMatch = await prisma.product.findUnique({ where: { slug: newSlug } });
    let counter = 1;
    while (slugMatch) {
      newSlug = `${generateSlug(newName)}-${counter}`;
      slugMatch = await prisma.product.findUnique({ where: { slug: newSlug } });
      counter++;
    }

    const duplicated = await prisma.product.create({
      data: {
        name: newName,
        slug: newSlug,
        shortDescription: existing.shortDescription,
        description: existing.description,
        category: existing.category,
        productType: existing.productType,
        version: existing.version,
        price: existing.price,
        status: "DRAFT",
        isLicenseRequired: existing.isLicenseRequired,
        featured: false,
        iconUrl: existing.iconUrl,
        bannerUrl: existing.bannerUrl,
        galleryImages: existing.galleryImages,
        downloadUrl: existing.downloadUrl,
        documentationUrl: existing.documentationUrl,
        githubUrl: existing.githubUrl,
        websiteUrl: existing.websiteUrl,
      },
    });

    return NextResponse.json({ success: true, product: duplicated, message: "PRODUCT_DUPLICATED" }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/products/[id]/duplicate Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
