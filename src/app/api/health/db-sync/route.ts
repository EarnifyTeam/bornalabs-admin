import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Synchronizing database schema with Prisma model definition...");

    // 1. Ensure User table columns exist
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPPORT', 'CUSTOMER');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "ProductCategory" AS ENUM ('AI_TOOL', 'CHROME_EXTENSION', 'DESKTOP_SOFTWARE', 'WEB_APPLICATION', 'AUTOMATION', 'API', 'FUTURE_PRODUCT');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'COMING_SOON', 'BETA', 'LIVE', 'DEPRECATED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "LicenseType" AS ENUM ('TRIAL', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME', 'CUSTOM');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "DeviceOS" AS ENUM ('WINDOWS', 'MAC', 'LINUX', 'CHROME_OS', 'OTHER');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "DeviceBrowser" AS ENUM ('CHROME', 'EDGE', 'BRAVE', 'OPERA', 'OTHER');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "ReleaseFileType" AS ENUM ('ZIP', 'CRX', 'EXE', 'MSI', 'DMG', 'APPIMAGE', 'DEB', 'RPM', 'APK', 'PDF');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "Platform" AS ENUM ('WINDOWS', 'MACOS', 'LINUX', 'CHROME', 'EDGE', 'BRAVE', 'OPERA', 'UNIVERSAL');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "NotificationType" AS ENUM ('MAINTENANCE', 'UPDATE', 'SECURITY', 'ANNOUNCEMENT');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // 2. Create User table & missing columns
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
        "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
        "premiumStatus" BOOLEAN NOT NULL DEFAULT false,
        "lastLoginAt" TIMESTAMP(3),
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );

      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "premiumStatus" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notes" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT '';
      
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `);

    // 3. Create Profile table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Profile" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "fullName" TEXT NOT NULL,
        "avatarUrl" TEXT,
        "phone" TEXT,
        "country" TEXT,
        "timezone" TEXT,
        CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "Profile_userId_key" ON "Profile"("userId");
    `);

    // 4. Create Session table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token");
    `);

    // 5. Create AuditLog table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL,
        "actorId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "entityName" TEXT NOT NULL,
        "entityId" TEXT,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "payload" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
      );
    `);

    return NextResponse.json({
      success: true,
      message: "✅ Database schema synchronized successfully with Prisma models!",
      syncedColumns: ["User.lastLoginAt", "User.premiumStatus", "User.notes"],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Database Schema Sync Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "DATABASE_SYNC_FAILED",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
