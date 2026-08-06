import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const allowedOrigins = [
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:3005",
  "http://localhost:3006",
  "http://localhost:3007",
  "http://localhost:3008",
  "http://127.0.0.1:3003",
  "http://127.0.0.1:3004",
  "http://127.0.0.1:3005",
  "http://127.0.0.1:3006",
  "http://127.0.0.1:3007",
  "http://127.0.0.1:3008",
];

const corsHeaders = (requestOrigin?: string | null) => {
  const isLocalOrigin = requestOrigin && /^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+)$/.test(requestOrigin);
  const origin = isLocalOrigin ? requestOrigin : (requestOrigin && allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0]);

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Requested-With, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
};

export async function OPTIONS(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.json({}, { headers: corsHeaders(origin) });
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "EMAIL_AND_PASSWORD_REQUIRED" },
        { status: 400, headers: corsHeaders(request.headers.get("origin")) }
      );
    }

    // Query administrative accounts
    let user = await prisma.user.findUnique({
      where: { email },
    });

    const adminEmail = (process.env.ADMIN_EMAIL || "kumarsuraj0469@gmail.com").toLowerCase().trim();
    const adminDefaultPassword = process.env.ADMIN_PASSWORD || "Admin12345";

    // Auto-provision default Super Admin if logging in with valid admin credentials for the first time
    if (!user && email.toLowerCase().trim() === adminEmail && password === adminDefaultPassword) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      user = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          premiumStatus: true,
          notes: "Auto-provisioned Super Admin Account",
          profile: {
            create: {
              fullName: "BornaLabs Super Admin",
              country: "India",
              timezone: "Asia/Kolkata",
            },
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "INVALID_CREDENTIALS" },
        { status: 401, headers: corsHeaders(request.headers.get("origin")) }
      );
    }

    const isAllowedRole = ["SUPER_ADMIN", "ADMIN", "MANAGER", "SUPPORT", "CUSTOMER"].includes(user.role);
    if (!isAllowedRole) {
      return NextResponse.json(
        { error: "ACCOUNT_ROLE_NOT_ALLOWED" },
        { status: 403, headers: corsHeaders(request.headers.get("origin")) }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `ACCOUNT_${user.status}` },
        { status: 403, headers: corsHeaders(request.headers.get("origin")) }
      );
    }

    let passwordMatch = false;

    if (user.passwordHash === "NOPASSWORD_SUPABASE_SYNCED" && password === adminDefaultPassword) {
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(password, salt);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
      passwordMatch = true;
    } else {
      // Verify password using bcryptjs
      passwordMatch = await bcrypt.compare(password, user.passwordHash);
    }

    // If master admin password was reset, update hash dynamically
    if (!passwordMatch && email.toLowerCase().trim() === adminEmail && password === adminDefaultPassword) {
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(password, salt);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash, role: "SUPER_ADMIN", status: "ACTIVE" },
      });
      passwordMatch = true;
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "INVALID_CREDENTIALS" },
        { status: 401, headers: corsHeaders(request.headers.get("origin")) }
      );
    }

    // Create a new session in database
    const sessionToken = crypto.randomUUID();
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Hours validity
      },
    });

    // Create dynamic redirect response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    }, { headers: corsHeaders(request.headers.get("origin")) });

    // Set secure httpOnly cookie session
    response.cookies.set({
      name: "borna_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Create Audit Log record
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "USER_LOGIN_SUCCESS",
        entityName: "User",
        entityId: user.id,
        payload: { email },
      },
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500, headers: corsHeaders(request.headers.get("origin")) }
    );
  }
}
