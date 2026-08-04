import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Role, UserStatus } from "@prisma/client";

/**
 * GET: Query users list from database with filters and search
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role") as Role | null;
    const status = searchParams.get("status") as UserStatus | null;

    const whereClause: any = {};
    if (role) whereClause.role = role;
    if (status) whereClause.status = status;

    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
        { profile: { fullName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        profile: true,
        _count: {
          select: { licenses: true, orders: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("GET /api/users Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new user account with profile
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, role, status, premiumStatus, phone, notes } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "EMAIL_AND_FULL_NAME_REQUIRED" },
        { status: 400 }
      );
    }

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "EMAIL_ALREADY_EXISTS" },
        { status: 409 }
      );
    }

    const passwordHash = password || "$2a$10$placeholderhash";

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: (role as Role) || "SUPPORT",
        status: (status as UserStatus) || "ACTIVE",
        premiumStatus: premiumStatus ?? false,
        notes: notes || null,
        profile: {
          create: {
            fullName,
            phone: phone || null,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error("POST /api/users Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
