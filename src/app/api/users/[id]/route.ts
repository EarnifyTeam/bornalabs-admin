import { NextResponse } from "next/server";
import prisma, { ensureDbSynced } from "@/lib/prisma";
import { Role, UserStatus } from "@prisma/client";

const createPrismaUserFromSupabaseAuth = async (authUser: any) => {
  const metadata = authUser.raw_user_meta_data || {};
  const email = authUser.email || "";

  if (!email) return null;

  return prisma.user.create({
    data: {
      id: authUser.id,
      email,
      passwordHash: "NOPASSWORD_SUPABASE_SYNCED",
      role: (metadata.role as Role) || Role.CUSTOMER,
      status: authUser.confirmed_at ? UserStatus.ACTIVE : UserStatus.INACTIVE,
      premiumStatus: false,
      notes: "Imported from Supabase Auth",
      profile: {
        create: {
          fullName: (metadata.full_name as string) || email,
          phone: authUser.phone || (metadata.phone as string) || null,
          avatarUrl: null,
          country: (metadata.country as string) || "Global",
          timezone: (metadata.timezone as string) || "UTC",
        },
      },
    },
    include: { profile: true },
  });
};

const findSupabaseAuthUserById = async (id: string) => {
  const [authUser] = await prisma.$queryRaw<Array<any>>`
    SELECT id, email, raw_user_meta_data, created_at, updated_at, confirmed_at, last_sign_in_at, phone
    FROM auth.users
    WHERE id = ${id}::uuid AND deleted_at IS NULL
    LIMIT 1
  `;

  return authUser || null;
};

const mapSupabaseAuthUserToDetailRecord = (authUser: any) => {
  const metadata = authUser.raw_user_meta_data || {};
  const email = authUser.email || "";

  return {
    id: authUser.id,
    email,
    passwordHash: "NOPASSWORD_SUPABASE_SYNCED",
    role: (metadata.role as Role) || Role.CUSTOMER,
    status: authUser.confirmed_at ? UserStatus.ACTIVE : UserStatus.INACTIVE,
    premiumStatus: false,
    notes: "Registered via Supabase public signup",
    lastLoginAt: authUser.last_sign_in_at || null,
    createdAt: authUser.created_at ? new Date(authUser.created_at).toISOString() : new Date().toISOString(),
    updatedAt: authUser.updated_at ? new Date(authUser.updated_at).toISOString() : new Date().toISOString(),
    profile: {
      fullName: (metadata.full_name as string) || email,
      phone: authUser.phone || (metadata.phone as string) || null,
      avatarUrl: null,
      country: (metadata.country as string) || "Global",
      timezone: (metadata.timezone as string) || "UTC",
    },
  };
};

const updateSupabaseAuthUser = async (id: string, body: any) => {
  const metadataUpdates: Record<string, any> = {};

  if (body.fullName !== undefined) metadataUpdates.full_name = body.fullName;
  if (body.country !== undefined) metadataUpdates.country = body.country;
  if (body.timezone !== undefined) metadataUpdates.timezone = body.timezone;
  if (body.role !== undefined) metadataUpdates.role = body.role;

  if (Object.keys(metadataUpdates).length > 0) {
    await prisma.$executeRaw`
      UPDATE auth.users
      SET raw_user_meta_data = raw_user_meta_data || ${metadataUpdates}
      WHERE id = ${id}::uuid AND deleted_at IS NULL
    `;
  }

  if (body.phone !== undefined) {
    await prisma.$executeRaw`
      UPDATE auth.users
      SET phone = ${body.phone}
      WHERE id = ${id}::uuid AND deleted_at IS NULL
    `;
  }
};

/**
 * GET: Fetch complete single User Profile details including assigned licenses, products & devices
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDbSynced();
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

    if (user) {
      return NextResponse.json({ success: true, user });
    }

    const authUser = await findSupabaseAuthUserById(params.id);
    if (authUser) {
      return NextResponse.json({ success: true, user: mapSupabaseAuthUserToDetailRecord(authUser) });
    }

    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
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

    let user = existing;

    if (!existing) {
      const authUser = await findSupabaseAuthUserById(params.id);
      if (!authUser) {
        return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
      }
      user = await createPrismaUserFromSupabaseAuth(authUser);
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

    const authUser = await findSupabaseAuthUserById(params.id);
    if (authUser) {
      await updateSupabaseAuthUser(params.id, body);
    }

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
