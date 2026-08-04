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
 * GET: Fetch single product details by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update product fields with slug collision checks
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const existing = await prisma.product.findUnique({ where: { id: params.id } });

    if (!existing) {
      return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
    }

    let slug = body.slug ? generateSlug(body.slug) : undefined;
    if (slug && slug !== existing.slug) {
      const slugMatch = await prisma.product.findUnique({ where: { slug } });
      if (slugMatch && slugMatch.id !== params.id) {
        let counter = 1;
        let baseSlug = slug;
        while (slugMatch) {
          slug = `${baseSlug}-${counter}`;
          const check = await prisma.product.findUnique({ where: { slug } });
          if (!check || check.id === params.id) break;
          counter++;
        }
      }
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(slug && { slug }),
        ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
        ...(body.description && { description: body.description }),
        ...(body.category && { category: body.category }),
        ...(body.productType && { productType: body.productType }),
        ...(body.version && { version: body.version }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.status && { status: body.status }),
        ...(body.isLicenseRequired !== undefined && { isLicenseRequired: body.isLicenseRequired }),
        ...(body.featured !== undefined && { featured: body.featured }),
        ...(body.iconUrl !== undefined && { iconUrl: body.iconUrl }),
        ...(body.bannerUrl !== undefined && { bannerUrl: body.bannerUrl }),
        ...(body.galleryImages && { galleryImages: body.galleryImages }),
        ...(body.downloadUrl !== undefined && { downloadUrl: body.downloadUrl }),
        ...(body.documentationUrl !== undefined && { documentationUrl: body.documentationUrl }),
        ...(body.githubUrl !== undefined && { githubUrl: body.githubUrl }),
        ...(body.websiteUrl !== undefined && { websiteUrl: body.websiteUrl }),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("PATCH /api/products/[id] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Soft delete product (sets deletedAt timestamp)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      await prisma.product.delete({ where: { id: params.id } });
      return NextResponse.json({ success: true, message: "PRODUCT_PERMANENTLY_DELETED" });
    }

    const softDeleted = await prisma.product.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, product: softDeleted, message: "PRODUCT_SOFT_DELETED" });
  } catch (error: any) {
    console.error("DELETE /api/products/[id] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
