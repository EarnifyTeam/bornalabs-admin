import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * DELETE: Remove a product listing from database by ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "PRODUCT_DELETED" });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
