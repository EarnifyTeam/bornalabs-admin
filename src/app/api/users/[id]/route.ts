import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UserStatus, Role } from "@prisma/client";

/**
 * PATCH: Update user details (status, role, premiumStatus)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, role, premiumStatus, notes, password } = body;

    // Build update payload
    const updateData: any = {};
    if (status !== undefined) updateData.status = status as UserStatus;
    if (role !== undefined) updateData.role = role as Role;
    if (premiumStatus !== undefined) updateData.premiumStatus = premiumStatus;
    if (notes !== undefined) updateData.notes = notes;
    if (password !== undefined && password !== "") updateData.passwordHash = password;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
