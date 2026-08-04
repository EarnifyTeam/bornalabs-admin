import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LicenseService } from "@/services/license.service";
import { LicenseType } from "@prisma/client";

/**
 * GET: Fetch all licenses with associated users, products, and device counts
 */
export async function GET() {
  try {
    const licenses = await prisma.license.findMany({
      include: {
        user: true,
        product: true,
        _count: {
          select: { devices: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ success: true, licenses });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST: Generate a new license key [Admin only]
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, productSlug, type, prefix, deviceLimit, durationDays } = body;

    if (!email || !productSlug || !type) {
      return NextResponse.json(
        { error: "EMAIL_PRODUCT_SLUG_AND_TYPE_REQUIRED" },
        { status: 400 }
      );
    }

    // Resolve user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Resolve product by slug
    const product = await prisma.product.findUnique({
      where: { slug: productSlug }
    });

    if (!product) {
      return NextResponse.json(
        { error: "PRODUCT_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Generate license using LicenseService
    const license = await LicenseService.createLicense({
      userId: user.id,
      productId: product.id,
      type: type as LicenseType,
      prefix: prefix || "BL",
      deviceLimit: deviceLimit ? parseInt(deviceLimit) : 1,
      validDays: durationDays ? parseInt(durationDays) : undefined,
    });

    return NextResponse.json({ success: true, license }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
