import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET: Fetch single release package details
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const release = await prisma.release.findUnique({
      where: { id: params.id },
      include: {
        product: true,
        downloads: true,
      },
    });

    if (!release) {
      return NextResponse.json({ error: "RELEASE_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      release: {
        ...release,
        fileSize: release.fileSize ? Number(release.fileSize) : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update release details or Rollback / Set as active latest version
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const existing = await prisma.release.findUnique({ where: { id: params.id } });

    if (!existing) {
      return NextResponse.json({ error: "RELEASE_NOT_FOUND" }, { status: 404 });
    }

    // Rollback feature: set this specific version as latest
    if (body.isLatest === true) {
      await prisma.release.updateMany({
        where: { productId: existing.productId },
        data: { isLatest: false },
      });

      await prisma.product.update({
        where: { id: existing.productId },
        data: {
          version: existing.version,
          downloadUrl: existing.fileUrl,
        },
      });
    }

    const updated = await prisma.release.update({
      where: { id: params.id },
      data: {
        ...(body.version && { version: body.version }),
        ...(body.releaseNotes !== undefined && { releaseNotes: body.releaseNotes }),
        ...(body.isForceUpdate !== undefined && { isForceUpdate: body.isForceUpdate }),
        ...(body.isLatest !== undefined && { isLatest: body.isLatest }),
        ...(body.platform && { platform: body.platform }),
      },
      include: {
        product: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      release: {
        ...updated,
        fileSize: updated.fileSize ? Number(updated.fileSize) : null,
      },
    });
  } catch (error: any) {
    console.error("PATCH /api/releases/[id] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete release package
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.release.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "RELEASE_DELETED" });
  } catch (error: any) {
    console.error("DELETE /api/releases/[id] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
