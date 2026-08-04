import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Role, UserStatus } from "@prisma/client";

/**
 * GET: Search, filter (role, status), sort, and paginate users with profile
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { profile: { fullName: { contains: search, mode: "insensitive" } } },
        { profile: { phone: { contains: search, mode: "insensitive" } } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && role !== "ALL") {
      where.role = role as Role;
    }

    if (status && status !== "ALL") {
      where.status = status as UserStatus;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          _count: {
            select: { licenses: true, downloads: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/users Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new user account with associated profile
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      fullName,
      role,
      status,
      phone,
      country,
      timezone,
      avatarUrl,
      notes,
    } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "REQUIRED_FIELDS_MISSING", message: "Email and Full Name are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "EMAIL_ALREADY_EXISTS", message: "A user with this email address already exists." },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: "NOPASSWORD_ADMIN_REGISTERED",
        role: (role || "CUSTOMER") as Role,
        status: (status || "ACTIVE") as UserStatus,
        notes: notes || null,
        profile: {
          create: {
            fullName,
            avatarUrl: avatarUrl || null,
            phone: phone || null,
            country: country || null,
            timezone: timezone || null,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/users Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
