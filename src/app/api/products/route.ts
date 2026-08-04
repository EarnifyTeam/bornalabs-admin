import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ProductCategory, ProductStatus } from "@prisma/client";

/**
   * GET: Query all product records
   */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as ProductCategory | null;
    const status = searchParams.get("status") as ProductStatus | null;

    const whereClause: any = {};
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { _count: { select: { licenses: true, releases: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

/**
   * POST: Create a new software product listing [Admin only]
   */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, category, price, isLicenseRequired, status, downloadUrl, documentationUrl, iconUrl } = body;

    if (!name || !slug || !category || price === undefined) {
      return NextResponse.json(
        { error: "NAME_SLUG_CATEGORY_AND_PRICE_REQUIRED" },
        { status: 400 }
      );
    }

    // Check slug duplicates
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "SLUG_ALREADY_EXISTS" },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        category,
        price,
        isLicenseRequired: isLicenseRequired ?? true,
        status: status ?? "COMING_SOON",
        downloadUrl,
        documentationUrl,
        iconUrl,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
