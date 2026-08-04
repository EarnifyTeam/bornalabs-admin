import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ReleaseService } from "@/services/release.service";
import { ReleaseFileType } from "@prisma/client";

/**
 * GET: Retrieve release version history for products and extensions
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const productSlug = searchParams.get("productSlug");

    const whereClause: any = {};
    if (productId) {
      whereClause.productId = productId;
    } else if (productSlug) {
      whereClause.product = { slug: productSlug };
    }

    const releases = await prisma.release.findMany({
      where: whereClause,
      include: {
        product: true,
        _count: {
          select: { downloads: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, releases });
  } catch (error) {
    console.error("GET /api/releases Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST: Publish/create a new software release log
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, productSlug, version, releaseNotes, fileUrl, fileType, isForceUpdate, supportedBrowsers } = body;

    if ((!productId && !productSlug) || !version || !fileUrl || !fileType) {
      return NextResponse.json(
        { error: "PRODUCT_ID_VERSION_FILEURL_AND_FILETYPE_REQUIRED" },
        { status: 400 }
      );
    }

    // Resolve product
    let targetProductId = productId;
    if (!targetProductId && productSlug) {
      const product = await prisma.product.findUnique({
        where: { slug: productSlug },
      });
      if (!product) {
        return NextResponse.json(
          { error: "PRODUCT_NOT_FOUND" },
          { status: 404 }
        );
      }
      targetProductId = product.id;
    }

    const release = await ReleaseService.createRelease({
      productId: targetProductId,
      version,
      releaseNotes: releaseNotes || "",
      fileUrl,
      fileType: fileType as ReleaseFileType,
      isForceUpdate: !!isForceUpdate,
      supportedBrowsers: supportedBrowsers || [],
    });

    return NextResponse.json({ success: true, release }, { status: 201 });
  } catch (error) {
    console.error("POST /api/releases Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
