import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "EMAIL_AND_PASSWORD_REQUIRED" },
        { status: 400 }
      );
    }

    // Query administrative accounts
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Auto-provision default Super Admin if logging in with valid admin credentials for the first time
    if (!user && email.toLowerCase() === "kumarsuraj0469@gmail.com" && password === "Admin12345") {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      user = await prisma.user.create({
        data: {
          email: "kumarsuraj0469@gmail.com",
          passwordHash,
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          premiumStatus: true,
          notes: "Auto-provisioned Super Admin Account",
          profile: {
            create: {
              fullName: "Suraj Kumar (Super Admin)",
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
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `ACCOUNT_${user.status}` },
        { status: 403 }
      );
    }

    // Verify password using bcryptjs
    let passwordMatch = await bcrypt.compare(password, user.passwordHash);

    // If master admin password was reset, update hash dynamically
    if (!passwordMatch && email.toLowerCase() === "kumarsuraj0469@gmail.com" && password === "Admin12345") {
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
        { status: 401 }
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
    });

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
      { status: 500 }
    );
  }
}
