import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ReleaseFileType, Platform } from "@prisma/client";

/**
 * GET: Search, filter (productId, platform, fileType), sort, and paginate releases
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const productId = searchParams.get("productId");
    const platform = searchParams.get("platform");
    const fileType = searchParams.get("fileType");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { version: { contains: search, mode: "insensitive" } },
        { fileName: { contains: search, mode: "insensitive" } },
        { releaseNotes: { contains: search, mode: "insensitive" } },
        { product: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (productId && productId !== "ALL") {
      where.productId = productId;
    }

    if (platform && platform !== "ALL") {
      where.platform = platform as Platform;
    }

    if (fileType && fileType !== "ALL") {
      where.fileType = fileType as ReleaseFileType;
    }

    const [releases, total] = await Promise.all([
      prisma.release.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, category: true },
          },
          _count: {
            select: { downloads: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.release.count({ where }),
    ]);

    // Format BigInt fileSize to number for JSON response
    const formattedReleases = releases.map((r) => ({
      ...r,
      fileSize: r.fileSize ? Number(r.fileSize) : null,
    }));

    return NextResponse.json({
      success: true,
      releases: formattedReleases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/releases Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Upload/Register a new software package release
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productId,
      version,
      fileName,
      fileUrl,
      storagePath,
      fileType,
      platform,
      fileSize,
      checksum,
      releaseNotes,
      isForceUpdate,
      isLatest,
    } = body;

    if (!productId || !version || !fileUrl) {
      return NextResponse.json(
        { error: "REQUIRED_FIELDS_MISSING", message: "Product, Version, and File URL are required." },
        { status: 400 }
      );
    }

    const markLatest = isLatest !== false; // Default true for new releases

    // If new release is set as latest, unmark existing latest releases for the product
    if (markLatest) {
      await prisma.release.updateMany({
        where: { productId },
        data: { isLatest: false },
      });
    }

    const release = await prisma.release.create({
      data: {
        productId,
        version: version.trim(),
        fileName: fileName || `${version}.${(fileType || "zip").toLowerCase()}`,
        fileUrl,
        storagePath: storagePath || null,
        fileType: (fileType || "ZIP") as ReleaseFileType,
        platform: (platform || "UNIVERSAL") as Platform,
        fileSize: fileSize ? BigInt(fileSize) : null,
        checksum: checksum || null,
        releaseNotes: releaseNotes || `Release ${version}`,
        isForceUpdate: !!isForceUpdate,
        isLatest: markLatest,
      },
      include: {
        product: { select: { id: true, name: true } },
      },
    });

    // Also update product downloadUrl & version if latest
    if (markLatest) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          version: version.trim(),
          downloadUrl: fileUrl,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        release: {
          ...release,
          fileSize: release.fileSize ? Number(release.fileSize) : null,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/releases Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
