import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * DELETE: Remove a release listing by ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.release.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "RELEASE_DELETED_OR_ROLLED_BACK" });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
