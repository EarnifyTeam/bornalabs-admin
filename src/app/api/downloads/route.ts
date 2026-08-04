import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET: Download statistics summary and log list
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId && productId !== "ALL") {
      where.productId = productId;
    }

    const [downloads, total, totalReleases] = await Promise.all([
      prisma.download.findMany({
        where,
        include: {
          product: { select: { id: true, name: true } },
          release: { select: { id: true, version: true, fileName: true } },
          user: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.download.count({ where }),
      prisma.release.count(),
    ]);

    return NextResponse.json({
      success: true,
      downloads,
      stats: {
        totalDownloads: total,
        totalReleases,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/downloads Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Record download event
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, releaseId, userId, ipAddress, userAgent } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "PRODUCT_ID_REQUIRED" },
        { status: 400 }
      );
    }

    const download = await prisma.download.create({
      data: {
        productId,
        releaseId: releaseId || null,
        userId: userId || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    return NextResponse.json({ success: true, download }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/downloads Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
