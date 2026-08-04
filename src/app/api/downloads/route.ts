import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET: Retrieve global download telemetry logs
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const whereClause: any = {};
    if (productId) whereClause.productId = productId;

    const downloads = await prisma.download.findMany({
      where: whereClause,
      include: {
        product: true,
        release: true,
        user: { include: { profile: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ success: true, downloads });
  } catch (error) {
    console.error("GET /api/downloads Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST: Record a new download event
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
        ipAddress: ipAddress || "127.0.0.1",
        userAgent: userAgent || "BornaLabs Client",
      },
      include: {
        product: true,
        release: true,
      },
    });

    return NextResponse.json({ success: true, download }, { status: 201 });
  } catch (error) {
    console.error("POST /api/downloads Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
