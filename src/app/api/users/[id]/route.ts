import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET: Fetch complete single User Profile details including assigned licenses, products & devices
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        profile: true,
        licenses: {
          include: {
            product: true,
            devices: true,
          },
          orderBy: { createdAt: "desc" },
        },
        downloads: {
          include: {
            product: { select: { name: true } },
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update user profile, role (SUPER_ADMIN, ADMIN, CUSTOMER), status (ACTIVE, SUSPENDED, BANNED)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const existing = await prisma.user.findUnique({ where: { id: params.id } });

    if (!existing) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(body.role && { role: body.role }),
        ...(body.status && { status: body.status }),
        ...(body.premiumStatus !== undefined && { premiumStatus: body.premiumStatus }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.lastLoginAt && { lastLoginAt: new Date(body.lastLoginAt) }),
        profile: {
          upsert: {
            create: {
              fullName: body.fullName || "User",
              phone: body.phone || null,
              avatarUrl: body.avatarUrl || null,
              country: body.country || null,
              timezone: body.timezone || null,
            },
            update: {
              ...(body.fullName && { fullName: body.fullName }),
              ...(body.phone !== undefined && { phone: body.phone }),
              ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
              ...(body.country !== undefined && { country: body.country }),
              ...(body.timezone !== undefined && { timezone: body.timezone }),
            },
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("PATCH /api/users/[id] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove user account (Super Admin privilege)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "USER_ACCOUNT_DELETED" });
  } catch (error: any) {
    console.error("DELETE /api/users/[id] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
