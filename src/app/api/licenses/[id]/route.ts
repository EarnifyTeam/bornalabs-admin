import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LicenseStatus } from "@prisma/client";

/**
 * PATCH: Update license status (suspend / reactivate)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "STATUS_REQUIRED" },
        { status: 400 }
      );
    }

    const updatedLicense = await prisma.license.update({
      where: { id },
      data: { status: status as LicenseStatus },
    });

    return NextResponse.json({ success: true, license: updatedLicense });
  } catch (error) {
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
