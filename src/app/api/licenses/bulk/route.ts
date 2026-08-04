import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LicenseService } from "@/services/license.service";
import { LicenseType } from "@prisma/client";

/**
 * POST: Bulk generate N license keys in batch
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { count, email, productId, type, prefix, deviceLimit, durationDays } = body;

    const qty = Math.min(Math.max(parseInt(count || "1"), 1), 100);

    if (!productId || !type) {
      return NextResponse.json(
        { error: "PRODUCT_ID_AND_TYPE_REQUIRED" },
        { status: 400 }
      );
    }

    // Resolve or find default user
    let user = email
      ? await prisma.user.findUnique({ where: { email } })
      : await prisma.user.findFirst();

    if (!user) {
      // Create system default admin user if none exists
      user = await prisma.user.create({
        data: {
          email: email || "admin@bornalabs.com",
          passwordHash: "$2a$10$placeholderhash",
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          profile: {
            create: {
              fullName: "Admin License Holder",
            },
          },
        },
      });
    }

    const generatedLicenses = [];

    for (let i = 0; i < qty; i++) {
      const license = await LicenseService.createLicense({
        userId: user.id,
        productId,
        type: (type as LicenseType) || "TRIAL",
        prefix: prefix || "BL",
        deviceLimit: deviceLimit ? parseInt(deviceLimit) : 1,
        validDays: durationDays ? parseInt(durationDays) : undefined,
      });

      generatedLicenses.push(license);
    }

    return NextResponse.json(
      {
        success: true,
        count: generatedLicenses.length,
        licenses: generatedLicenses,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk License Generation Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
