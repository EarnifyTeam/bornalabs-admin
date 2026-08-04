import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return NextResponse.json({ success: true, licenses: [] });
    }

    const licenses = await prisma.license.findMany({
      where: { userId: user.id },
      include: {
        product: { select: { id: true, name: true, category: true, version: true } },
        devices: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, licenses });
  } catch (error: any) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
