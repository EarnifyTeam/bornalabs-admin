import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST: Restore soft-deleted product (clears deletedAt)
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const restored = await prisma.product.update({
      where: { id: params.id },
      data: { deletedAt: null },
    });

    return NextResponse.json({ success: true, product: restored, message: "PRODUCT_RESTORED" });
  } catch (error: any) {
    console.error("POST /api/products/[id]/restore Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
