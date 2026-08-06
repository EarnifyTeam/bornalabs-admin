import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const rawEmail = searchParams.get("userEmail") || searchParams.get("email") || "";
    const cleanUserEmail = rawEmail.trim().toLowerCase();

    let user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    if (!user && cleanUserEmail) {
      user = await prisma.user.findFirst({
        where: { email: { equals: cleanUserEmail, mode: "insensitive" } },
      });
    }

    if (!user && !cleanUserEmail) {
      return NextResponse.json({ success: true, products: [] });
    }

    const userLicenses = await prisma.license.findMany({
      where: {
        OR: [
          ...(user?.id ? [{ userId: user.id }] : []),
          ...(cleanUserEmail ? [{ user: { email: { equals: cleanUserEmail, mode: "insensitive" as const } } }] : []),
        ],
      },
      include: {
        product: true,
      },
    });

    const productsMap = new Map();
    userLicenses.forEach((l) => {
      if (l.product && !productsMap.has(l.product.id)) {
        productsMap.set(l.product.id, {
          ...l.product,
          price: Number(l.product.price),
        });
      }
    });

    return NextResponse.json({
      success: true,
      products: Array.from(productsMap.values()),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
