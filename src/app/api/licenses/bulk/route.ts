import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LicenseType } from "@prisma/client";

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
 * POST: Bulk batch license generator (creates up to 100 license keys in a transaction)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity, type, deviceLimit, expiryDays } = body;

    const qty = Math.min(Math.max(parseInt(quantity || "1", 10), 1), 100);

    if (!productId) {
      return NextResponse.json(
        { error: "PRODUCT_ID_REQUIRED", message: "Target Product is required." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
    }

    // Default admin user assignment for batch keys
    const adminUser = await prisma.user.findFirst();
    if (!adminUser) {
      return NextResponse.json({ error: "USER_REQUIRED" }, { status: 400 });
    }

    const prefix = getPrefixForProduct(product.name, product.category);

    let expiresAt: Date | null = null;
    if (expiryDays && parseInt(expiryDays, 10) > 0) {
      const days = parseInt(expiryDays, 10);
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
    }

    const keysToCreate: Array<{
      licenseKey: string;
      productId: string;
      userId: string;
      type: LicenseType;
      prefix: string;
      status: any;
      deviceLimit: number;
      expiresAt: Date | null;
    }> = [];

    for (let i = 0; i < qty; i++) {
      let licenseKey = formatLicenseKey(prefix);
      keysToCreate.push({
        licenseKey,
        productId,
        userId: adminUser.id,
        type: (type || "TRIAL") as LicenseType,
        prefix,
        status: "ACTIVE",
        deviceLimit: parseInt(deviceLimit || "1", 10),
        expiresAt,
      });
    }

    await prisma.license.createMany({
      data: keysToCreate,
      skipDuplicates: true,
    });

    const createdLicenses = await prisma.license.findMany({
      where: {
        productId,
        licenseKey: { in: keysToCreate.map((k) => k.licenseKey) },
      },
      include: {
        product: { select: { name: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        count: createdLicenses.length,
        licenses: createdLicenses,
        keys: createdLicenses.map((l) => l.licenseKey),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/licenses/bulk Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
