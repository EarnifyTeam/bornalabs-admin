import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

let isSynced = false;

export async function ensureDbSynced() {
  if (isSynced) return;
  isSynced = true;

  const sqlStatements = [
    `DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPPORT', 'CUSTOMER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "ProductCategory" AS ENUM ('AI_TOOL', 'CHROME_EXTENSION', 'DESKTOP_SOFTWARE', 'WEB_APPLICATION', 'AUTOMATION', 'API', 'FUTURE_PRODUCT'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'COMING_SOON', 'BETA', 'LIVE', 'DEPRECATED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "LicenseType" AS ENUM ('TRIAL', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME', 'CUSTOM'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "DeviceOS" AS ENUM ('WINDOWS', 'MAC', 'LINUX', 'CHROME_OS', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "DeviceBrowser" AS ENUM ('CHROME', 'EDGE', 'BRAVE', 'OPERA', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "ReleaseFileType" AS ENUM ('ZIP', 'CRX', 'EXE', 'MSI', 'DMG', 'APPIMAGE', 'DEB', 'RPM', 'APK', 'PDF'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "Platform" AS ENUM ('WINDOWS', 'MACOS', 'LINUX', 'CHROME', 'EDGE', 'BRAVE', 'OPERA', 'UNIVERSAL'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3)`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "premiumStatus" BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notes" TEXT`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "shortDescription" TEXT`,
    `ALTER TABLE "Release" ADD COLUMN IF NOT EXISTS "fileName" TEXT`,
    `ALTER TABLE "License" ADD COLUMN IF NOT EXISTS "currentDevices" INTEGER NOT NULL DEFAULT 0`
  ];

  for (const stmt of sqlStatements) {
    try {
      await prisma.$executeRawUnsafe(stmt);
    } catch (err) {
      // Ignore individual statement errors
    }
  }
}
