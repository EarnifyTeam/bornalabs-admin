import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET: Fetch single license details by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const license = await prisma.license.findUnique({
      where: { id: params.id },
      include: {
        product: true,
        user: true,
        devices: true,
      },
    });

    if (!license) {
      return NextResponse.json({ error: "LICENSE_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ success: true, license });
  } catch (error: any) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update license status (ACTIVE, SUSPENDED, REVOKED), device limits, expiry date
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const existing = await prisma.license.findUnique({ where: { id: params.id } });

    if (!existing) {
      return NextResponse.json({ error: "LICENSE_NOT_FOUND" }, { status: 404 });
    }

    let expiresAt = existing.expiresAt;
    if (body.expiryDays !== undefined) {
      if (body.expiryDays === null || parseInt(body.expiryDays, 10) <= 0) {
        expiresAt = null;
      } else {
        const days = parseInt(body.expiryDays, 10);
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
      }
    }

    if (body.resetDevices) {
      await prisma.device.deleteMany({ where: { licenseId: params.id } });
    }

    const updated = await prisma.license.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.type && { type: body.type }),
        ...(body.deviceLimit !== undefined && { deviceLimit: parseInt(body.deviceLimit, 10) }),
        ...(body.notes !== undefined && { notes: body.notes }),
        expiresAt,
      },
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, license: updated });
  } catch (error: any) {
    console.error("PATCH /api/licenses/[id] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove license record from database
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.license.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "LICENSE_DELETED" });
  } catch (error: any) {
    console.error("DELETE /api/licenses/[id] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
