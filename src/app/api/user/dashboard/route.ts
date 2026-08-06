import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET: Fetch customer dashboard summary metrics, assigned products, active licenses & notifications
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const userEmail = searchParams.get("userEmail") || searchParams.get("email");

    let user = userId ? await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }) : null;

    if (!user && userEmail) {
      user = await prisma.user.findUnique({ where: { email: userEmail }, include: { profile: true } });
    }

    if (!user) {
      return NextResponse.json({
        success: true,
        user: null,
        stats: {
          totalLicenses: 0,
          activeLicenses: 0,
          assignedProductsCount: 0,
          totalDownloadsCount: 0,
        },
        products: [],
        licenses: [],
        notifications: [],
        recentDownloads: [],
      });
    }

    const [licenses, notifications, downloads] = await Promise.all([
      prisma.license.findMany({
        where: { userId: user.id },
        include: {
          product: {
            select: { id: true, name: true, category: true, version: true, downloadUrl: true, documentationUrl: true, iconUrl: true },
          },
          devices: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.findMany({
        where: { active: true },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.download.findMany({
        where: { userId: user.id },
        include: {
          product: { select: { name: true } },
          release: { select: { version: true } },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Unique assigned products derived from user licenses
    const assignedProductsMap = new Map();
    licenses.forEach((lic) => {
      if (lic.product && !assignedProductsMap.has(lic.product.id)) {
        assignedProductsMap.set(lic.product.id, lic.product);
      }
    });

    const activeLicenses = licenses.filter((l) => l.status === "ACTIVE");

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        fullName: user.profile?.fullName || "Valued Customer",
        phone: user.profile?.phone || null,
        country: user.profile?.country || "Global",
        timezone: user.profile?.timezone || "UTC",
        avatarUrl: user.profile?.avatarUrl || null,
      },
      stats: {
        totalLicenses: licenses.length,
        activeLicenses: activeLicenses.length,
        assignedProductsCount: assignedProductsMap.size,
        totalDownloadsCount: downloads.length,
      },
      products: Array.from(assignedProductsMap.values()),
      licenses,
      notifications,
      recentDownloads: downloads,
    });
  } catch (error: any) {
    console.error("GET /api/user/dashboard Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
