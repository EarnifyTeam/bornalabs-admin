import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UserStatus, Role } from "@prisma/client";

/**
 * GET: Retrieve single user account by ID with profile
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        licenses: { include: { product: true } },
        _count: { select: { licenses: true, orders: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * PATCH: Update user details (status, role, premiumStatus, profile info)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, role, premiumStatus, notes, fullName, phone, password } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status as UserStatus;
    if (role !== undefined) updateData.role = role as Role;
    if (premiumStatus !== undefined) updateData.premiumStatus = premiumStatus;
    if (notes !== undefined) updateData.notes = notes;
    if (password !== undefined && password !== "") updateData.passwordHash = password;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        ...(fullName !== undefined || phone !== undefined
          ? {
              profile: {
                upsert: {
                  create: {
                    fullName: fullName || "BornaLabs User",
                    phone: phone || null,
                  },
                  update: {
                    ...(fullName !== undefined && { fullName }),
                    ...(phone !== undefined && { phone }),
                  },
                },
              },
            }
          : {}),
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("PATCH /api/users/[id] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove a user record from database
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "USER_DELETED" });
  } catch (error) {
    console.error("DELETE /api/users/[id] Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
