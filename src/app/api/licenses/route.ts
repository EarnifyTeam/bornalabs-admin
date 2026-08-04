import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LicenseService } from "@/services/license.service";
import { LicenseType, LicenseStatus } from "@prisma/client";

/**
 * GET: Query all license records with user, product, and device relations
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status") as LicenseStatus | null;
    const type = searchParams.get("type") as LicenseType | null;
    const productId = searchParams.get("productId");

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;
    if (productId) whereClause.productId = productId;

    if (search) {
      whereClause.OR = [
        { licenseKey: { contains: search, mode: "insensitive" } },
        { prefix: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { product: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const licenses = await prisma.license.findMany({
      where: whereClause,
      include: {
        user: { include: { profile: true } },
        product: true,
        devices: true,
        _count: {
          select: { devices: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, licenses });
  } catch (error) {
    console.error("GET /api/licenses Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a single license key (Manual key or Auto-generated)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      productId,
      type,
      prefix,
      deviceLimit,
      durationDays,
      customKey,
      expiryDate,
    } = body;

    if (!productId || !type) {
      return NextResponse.json(
        { error: "PRODUCT_ID_AND_TYPE_REQUIRED" },
        { status: 400 }
      );
    }

    // Resolve or create user
    let user = email
      ? await prisma.user.findUnique({ where: { email } })
      : await prisma.user.findFirst();

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email || "admin@bornalabs.com",
          passwordHash: "$2a$10$placeholderhash",
          role: "SUPPORT",
          status: "ACTIVE",
          profile: {
            create: {
              fullName: email ? email.split("@")[0] : "License Holder",
            },
          },
        },
      });
    }

    const calculatedPrefix = (prefix || "BL").toUpperCase();
    const calculatedLimit = deviceLimit ? parseInt(deviceLimit) : 1;

    let licenseKey = customKey ? customKey.trim().toUpperCase() : undefined;

    if (!licenseKey) {
      licenseKey = LicenseService.generateLicenseKey(calculatedPrefix);
    }

    // Determine Expiry Date
    let finalExpiry: Date | null = null;
    if (expiryDate) {
      finalExpiry = new Date(expiryDate);
    } else if (durationDays) {
      finalExpiry = new Date(Date.now() + parseInt(durationDays) * 24 * 60 * 60 * 1000);
    }

    const license = await prisma.license.create({
      data: {
        licenseKey,
        userId: user.id,
        productId,
        type: type as LicenseType,
        prefix: calculatedPrefix,
        deviceLimit: calculatedLimit,
        expiryDate: finalExpiry,
        status: "ACTIVE",
      },
      include: {
        user: true,
        product: true,
        devices: true,
      },
    });

    return NextResponse.json({ success: true, license }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/licenses Error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "LICENSE_KEY_ALREADY_EXISTS" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
