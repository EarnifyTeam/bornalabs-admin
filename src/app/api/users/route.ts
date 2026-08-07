import { NextResponse } from "next/server";
import prisma, { ensureDbSynced } from "@/lib/prisma";
import { Role, UserStatus } from "@prisma/client";
import { createAdminClient } from "@/lib/supabase/service";

const mapSupabaseAuthDbUserToAdminRecord = (authUser: any) => {
  const metadata = authUser.raw_user_meta_data || {};
  const email = authUser.email || "";
  const role = (metadata.role as string) || "CUSTOMER";
  const status = authUser.confirmed_at ? "ACTIVE" : "INACTIVE";

  return {
    id: authUser.id,
    email,
    passwordHash: "",
    role,
    status,
    premiumStatus: false,
    lastLoginAt: authUser.last_sign_in_at || null,
    notes: "Registered via Supabase public signup",
    createdAt: authUser.created_at ? new Date(authUser.created_at).toISOString() : new Date().toISOString(),
    updatedAt: authUser.updated_at ? new Date(authUser.updated_at).toISOString() : new Date().toISOString(),
    profile: {
      fullName: (metadata.full_name as string) || (metadata.fullName as string) || email,
      phone: authUser.phone || (metadata.phone as string) || null,
      avatarUrl: null,
      country: (metadata.country as string) || "Global",
      timezone: (metadata.timezone as string) || "UTC",
    },
    _count: {
      licenses: 0,
      downloads: 0,
    },
  };
};

const fetchSupabaseAuthUsersFromDb = async () => {
  try {
    const authUsers = await prisma.$queryRaw<Array<any>>`
      SELECT id, email, raw_user_meta_data, created_at, updated_at, confirmed_at, last_sign_in_at, phone
      FROM auth.users
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    if (authUsers && authUsers.length > 0) {
      return authUsers
        .map(mapSupabaseAuthDbUserToAdminRecord)
        .filter((user) => user.email);
    }
  } catch (err) {
    // Fallback to Supabase Admin API client if raw DB query fails
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (!error && data?.users) {
      return data.users
        .map(mapSupabaseAuthDbUserToAdminRecord)
        .filter((user) => user.email);
    }
  } catch (err) {
    // Ignore fallback errors
  }

  return [];
};

const matchesFilters = (user: any, search: string, role?: string | null, status?: string | null) => {
  const lowerSearch = search.toLowerCase();
  const fullName = user.profile?.fullName?.toLowerCase() || "";
  const email = user.email?.toLowerCase() || "";
  const phone = user.profile?.phone?.toLowerCase() || "";
  const notes = user.notes?.toLowerCase() || "";

  if (search) {
    const matchesSearch =
      email.includes(lowerSearch) ||
      fullName.includes(lowerSearch) ||
      phone.includes(lowerSearch) ||
      notes.includes(lowerSearch);
    if (!matchesSearch) return false;
  }

  if (role && role !== "ALL") {
    if (role === "CUSTOMER") {
      if (user.role !== "CUSTOMER") return false;
    } else if (user.role !== role) {
      return false;
    }
  }

  if (status && status !== "ALL") {
    if (user.status !== status) return false;
  }

  return true;
};

/**
 * GET: Search, filter (role, status), sort, and paginate users with profile
 */
export async function GET(request: Request) {
  try {
    await ensureDbSynced();
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
      }),
      prisma.user.count({ where }),
    ]);

    const prismaEmails = new Set(users.map((user) => user.email.toLowerCase()));

    const authUsers = await fetchSupabaseAuthUsersFromDb();
    const supabaseUsers = authUsers
      .filter((user) => !prismaEmails.has(user.email.toLowerCase()))
      .filter((user) => matchesFilters(user, search, role, status));

    const combinedUsers = [...users, ...supabaseUsers].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const pagedUsers = combinedUsers.slice(skip, skip + limit);
    const combinedTotal = combinedUsers.length;

    return NextResponse.json({
      success: true,
      users: pagedUsers,
      pagination: {
        page,
        limit,
        total: combinedTotal,
        totalPages: Math.max(1, Math.ceil(combinedTotal / limit)),
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
    await ensureDbSynced();
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

    const supabaseAdmin = createAdminClient();
    const { data: createdAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: "TempPass@123",
      user_metadata: {
        full_name: fullName,
        country,
        timezone,
        role: role || "CUSTOMER",
      },
    });

    if (authError || !createdAuthUser.user) {
      console.error("Supabase admin.createUser error:", authError);
      return NextResponse.json(
        { error: "SUPABASE_USER_CREATION_FAILED", message: authError?.message || "Unable to create user in Supabase Auth." },
        { status: 500 }
      );
    }

    const authUser = createdAuthUser.user;
    const user = await prisma.user.create({
      data: {
        id: authUser.id,
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
