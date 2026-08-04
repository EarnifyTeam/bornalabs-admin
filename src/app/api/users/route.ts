import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET: Fetch all users in database with profiles
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
