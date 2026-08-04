import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LicenseStatus, LicenseType } from "@prisma/client";

/**
 * GET: Retrieve single license details by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const license = await prisma.license.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true } },
        product: true,
        devices: true,
      },
    });

    if (!license) {
      return NextResponse.json({ error: "LICENSE_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ success: true, license });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * PATCH: Update license status, device limit, or expiry date
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, deviceLimit, expiryDate, type } = body;

    const updateData: any = {};
    if (status) updateData.status = status as LicenseStatus;
    if (deviceLimit !== undefined) updateData.deviceLimit = parseInt(deviceLimit);
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (type) updateData.type = type as LicenseType;

    const updatedLicense = await prisma.license.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        product: true,
        devices: true,
      },
    });

    return NextResponse.json({ success: true, license: updatedLicense });
  } catch (error) {
    console.error("PATCH /api/licenses/[id] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Revoke/delete license key listing
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.license.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "LICENSE_REVOKED" });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
