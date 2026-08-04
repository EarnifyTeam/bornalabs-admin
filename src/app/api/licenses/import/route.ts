import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST: CSV Import endpoint for external license records array
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { licenses } = body; // Array of { licenseKey, productId, userEmail, type, deviceLimit, status }

    if (!licenses || !Array.isArray(licenses) || licenses.length === 0) {
      return NextResponse.json(
        { error: "LICENSES_ARRAY_REQUIRED", message: "An array of license items is required for CSV import." },
        { status: 400 }
      );
    }

    const adminUser = await prisma.user.findFirst();
    if (!adminUser) {
      return NextResponse.json({ error: "USER_REQUIRED" }, { status: 400 });
    }

    const firstProduct = await prisma.product.findFirst();
    if (!firstProduct) {
      return NextResponse.json({ error: "PRODUCT_REQUIRED", message: "Create at least one product before importing licenses." }, { status: 400 });
    }

    const payload = licenses.map((item) => ({
      licenseKey: item.licenseKey?.trim() || `BL-IMP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      productId: item.productId || firstProduct.id,
      userId: adminUser.id,
      type: item.type || "TRIAL",
      prefix: item.prefix || "BL-IMP",
      status: item.status || "ACTIVE",
      deviceLimit: parseInt(item.deviceLimit || "1", 10),
      notes: item.notes || "Imported via CSV",
    }));

    const result = await prisma.license.createMany({
      data: payload,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      importedCount: result.count,
      message: `Successfully imported ${result.count} licenses into database.`,
    });
  } catch (error: any) {
    console.error("POST /api/licenses/import Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
