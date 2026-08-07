import { NextResponse } from "next/server";
import prisma, { ensureDbSynced } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET: Fetch customer dashboard summary metrics, assigned products, active licenses & notifications
 */
export async function GET(request: Request) {
  try {
    await ensureDbSynced();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const rawEmail = searchParams.get("userEmail") || searchParams.get("email") || "";
    const cleanUserEmail = rawEmail.trim().toLowerCase();
    const emailPrefix = cleanUserEmail.split("@")[0];

    let user: any = userId ? await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }) : null;

    if (!user && cleanUserEmail) {
      user = await prisma.user.findFirst({
        where: { email: { equals: cleanUserEmail, mode: "insensitive" } },
        include: { profile: true },
      });

      // Auto-create Prisma user profile if user registered in Supabase Auth but not in Prisma yet
      if (!user) {
        try {
          user = await prisma.user.create({
            data: {
              email: cleanUserEmail,
              passwordHash: "",
              role: "CUSTOMER",
              status: "ACTIVE",
              profile: {
                create: {
                  fullName: cleanUserEmail.split("@")[0],
                  country: "Global",
                  timezone: "UTC",
                },
              },
            },
            include: { profile: true },
          });
        } catch (e) {
          // Fallback if create fails
        }
      }
    }

    const targetUserId = user?.id;

    // Comprehensive License Search: search by userId, email relation, notes, or email prefix
    let licenses = await prisma.license.findMany({
      where: {
        OR: [
          ...(targetUserId ? [{ userId: targetUserId }] : []),
          ...(cleanUserEmail ? [{ user: { email: { equals: cleanUserEmail, mode: "insensitive" as const } } }] : []),
          ...(cleanUserEmail ? [{ notes: { contains: cleanUserEmail, mode: "insensitive" as const } }] : []),
          ...(emailPrefix && emailPrefix.length > 2 ? [{ notes: { contains: emailPrefix, mode: "insensitive" as const } }] : []),
        ],
      },
      include: {
        product: {
          select: { id: true, name: true, category: true, version: true, downloadUrl: true, documentationUrl: true, iconUrl: true },
        },
        devices: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Fallback: If 0 licenses found and cleanUserEmail exists, fetch all active licenses to prevent 0 count if unlinked
    if (licenses.length === 0 && cleanUserEmail) {
      const allActiveLicenses = await prisma.license.findMany({
        where: { status: "ACTIVE" },
        include: {
          product: {
            select: { id: true, name: true, category: true, version: true, downloadUrl: true, documentationUrl: true, iconUrl: true },
          },
          devices: true,
          user: { select: { id: true, email: true } },
        },
        take: 20,
        orderBy: { createdAt: "desc" },
      });

      // Filter by email match if possible
      const matched = allActiveLicenses.filter((lic) => {
        const licEmail = (lic.user?.email || "").toLowerCase();
        const licNotes = (lic.notes || "").toLowerCase();
        return (
          licEmail.includes(cleanUserEmail) ||
          licNotes.includes(cleanUserEmail) ||
          (emailPrefix && (licEmail.includes(emailPrefix) || licNotes.includes(emailPrefix)))
        );
      });

      if (matched.length > 0) {
        licenses = matched;
      }
    }

    const [notifications, downloads] = await Promise.all([
      prisma.notification.findMany({
        where: { active: true },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.download.findMany({
        where: targetUserId ? { userId: targetUserId } : { id: "non-existent" },
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

    const activeLicenses = licenses.filter((l) => l.status === "ACTIVE" || (l.type as string) === "TRIAL");

    return NextResponse.json({
      success: true,
      user: user
        ? {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            fullName: user.profile?.fullName || user.email.split("@")[0],
            phone: user.profile?.phone || null,
            country: user.profile?.country || "Global",
            timezone: user.profile?.timezone || "UTC",
            avatarUrl: user.profile?.avatarUrl || null,
          }
        : {
            id: targetUserId || "guest",
            email: cleanUserEmail || "Guest User",
            role: "CUSTOMER",
            status: "ACTIVE",
            fullName: cleanUserEmail ? cleanUserEmail.split("@")[0] : "Customer",
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
