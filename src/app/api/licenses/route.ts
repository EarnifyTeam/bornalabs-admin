import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LicenseType, LicenseStatus } from "@prisma/client";

function generateRandomHex(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getPrefixForProduct(productName: string, productCategory?: string): string {
  const nameUpper = productName.toUpperCase();
  if (nameUpper.includes("PROMPTX")) return "BL-PX";
  if (productCategory === "CHROME_EXTENSION" || nameUpper.includes("EXTENSION")) return "BL-EXT";
  if (productCategory === "DESKTOP_SOFTWARE" || nameUpper.includes("DESKTOP")) return "BL-DESKTOP";
  if (productCategory === "AI_TOOL" || nameUpper.includes("AI")) return "BL-AI";
  if (productCategory === "WEB_APPLICATION") return "BL-WEB";
  if (productCategory === "AUTOMATION") return "BL-AUTO";
  if (productCategory === "API") return "BL-API";

  // Fallback slug prefix
  const code = productName.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
  return `BL-${code}`;
}

function formatLicenseKey(prefix: string): string {
  const part1 = generateRandomHex(4);
  const part2 = generateRandomHex(4);
  const part3 = generateRandomHex(4);
  return `${prefix}-${part1}-${part2}-${part3}`;
}

/**
 * GET: Search, filter (productId, type, status), sort, and paginate licenses
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const productId = searchParams.get("productId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { licenseKey: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { product: { name: { contains: search, mode: "insensitive" } } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    if (productId && productId !== "ALL") {
      where.productId = productId;
    }

    if (type && type !== "ALL") {
      where.type = type as LicenseType;
    }

    if (status && status !== "ALL") {
      where.status = status as LicenseStatus;
    }

    const [licenses, total] = await Promise.all([
      prisma.license.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, category: true, productType: true },
          },
          user: {
            select: { id: true, email: true },
          },
          _count: {
            select: { devices: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.license.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      licenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/licenses Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a single license (Auto Key Generator or Manual Custom Key)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productId,
      userId,
      userEmail,
      type,
      customLicenseKey,
      deviceLimit,
      expiryDays,
      notes,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "PRODUCT_ID_REQUIRED", message: "Target Product is required." },
        { status: 400 }
      );
    }

    // Find product to determine prefix
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
    }

    // Find or create assigned target user
    let targetUserId = userId;
    const cleanUserEmail = userEmail ? userEmail.trim().toLowerCase() : "";

    if (!targetUserId && cleanUserEmail) {
      let existingUser = await prisma.user.findFirst({
        where: { email: { equals: cleanUserEmail, mode: "insensitive" } },
      });
      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: {
            email: cleanUserEmail,
            passwordHash: "NOPASSWORD_ADMIN_ISSUED",
            role: "CUSTOMER",
            status: "ACTIVE",
          },
        });
      }
      targetUserId = existingUser.id;
    }

    if (!targetUserId) {
      // Fallback: assign to first super admin user or self
      const adminUser = await prisma.user.findFirst();
      if (!adminUser) {
        return NextResponse.json({ error: "USER_REQUIRED" }, { status: 400 });
      }
      targetUserId = adminUser.id;
    }

    const prefix = getPrefixForProduct(product.name, product.category);

    let licenseKey = customLicenseKey ? customLicenseKey.trim() : formatLicenseKey(prefix);

    // Verify key uniqueness
    let existingKey = await prisma.license.findUnique({ where: { licenseKey } });
    if (customLicenseKey && existingKey) {
      return NextResponse.json(
        { error: "LICENSE_KEY_EXISTS", message: "Custom license key already exists in database." },
        { status: 400 }
      );
    }

    while (existingKey) {
      licenseKey = formatLicenseKey(prefix);
      existingKey = await prisma.license.findUnique({ where: { licenseKey } });
    }

    // Expiry calculation
    let expiresAt: Date | null = null;
    if (expiryDays && parseInt(expiryDays, 10) > 0) {
      const days = parseInt(expiryDays, 10);
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
    }

    const license = await prisma.license.create({
      data: {
        licenseKey,
        productId,
        userId: targetUserId,
        type: (type || "TRIAL") as LicenseType,
        prefix,
        status: "ACTIVE",
        deviceLimit: parseInt(deviceLimit || "1", 10),
        expiresAt,
        notes: notes || null,
      },
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, license }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/licenses Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
