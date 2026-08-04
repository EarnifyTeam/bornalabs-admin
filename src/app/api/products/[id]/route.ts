import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET: Retrieve product details by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        releases: { orderBy: { createdAt: "desc" } },
        _count: { select: { licenses: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * PATCH: Update product fields by ID
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, slug, description, category, price, isLicenseRequired, status, downloadUrl, documentationUrl, iconUrl } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(price !== undefined && { price }),
        ...(isLicenseRequired !== undefined && { isLicenseRequired }),
        ...(status && { status }),
        ...(downloadUrl !== undefined && { downloadUrl }),
        ...(documentationUrl !== undefined && { documentationUrl }),
        ...(iconUrl !== undefined && { iconUrl }),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * DELETE: Remove a product listing from database by ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "PRODUCT_DELETED" });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
