import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ReleaseFileType } from "@prisma/client";

/**
 * GET: Fetch all release logs
 */
export async function GET() {
  try {
    const releases = await prisma.release.findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, releases });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST: Publish a new product version release
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productSlug, version, releaseNotes, isForceUpdate, fileUrl, fileType, supportedBrowsers } = body;

    if (!productSlug || !version || !fileUrl || !fileType) {
      return NextResponse.json(
        { error: "PRODUCT_SLUG_VERSION_FILE_URL_AND_FILE_TYPE_REQUIRED" },
        { status: 400 }
      );
    }

    // Resolve product ID
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
    });

    if (!product) {
      return NextResponse.json(
        { error: "PRODUCT_NOT_FOUND" },
        { status: 404 }
      );
    }

    const release = await prisma.release.create({
      data: {
        productId: product.id,
        version,
        releaseNotes: releaseNotes || "",
        isForceUpdate: !!isForceUpdate,
        fileUrl,
        fileType: fileType as ReleaseFileType,
        supportedBrowsers: supportedBrowsers || ["Chrome"],
      },
    });

    return NextResponse.json({ success: true, release }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
