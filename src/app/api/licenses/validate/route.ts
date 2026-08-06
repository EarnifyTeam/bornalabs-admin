import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:3005",
  "http://localhost:3006",
  "http://localhost:3007",
  "http://localhost:3008",
  "http://localhost:3009",
  "http://localhost:3010",
  "https://admin.bornalabs.in",
  "https://dashboard.bornalabs.in",
  "https://bornalabs.in",
];

const corsHeaders = (requestOrigin?: string | null) => {
  const isLocalOrigin = requestOrigin && /^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+)$/.test(requestOrigin);
  const origin = isLocalOrigin
    ? requestOrigin
    : requestOrigin && allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : "*";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
};

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return NextResponse.json({}, { headers: corsHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  try {
    const body = await request.json();
    const rawCode = body.licenseKey || body.code || body.p_code || "";
    const rawDeviceId = body.deviceId || body.p_device_id || body.hwFingerprint || "unknown-device";

    const cleanCode = rawCode.trim();
    if (!cleanCode) {
      return NextResponse.json(
        { ok: false, error: "License key is required" },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const license = await prisma.license.findFirst({
      where: { licenseKey: { equals: cleanCode, mode: "insensitive" } },
      include: {
        product: { select: { id: true, name: true, category: true } },
        user: { select: { id: true, email: true } },
        devices: true,
      },
    });

    if (!license) {
      return NextResponse.json(
        { ok: false, error: "Invalid license key" },
        { status: 404, headers: corsHeaders(origin) }
      );
    }

    if (license.status !== "ACTIVE") {
      return NextResponse.json(
        { ok: false, error: `License key is ${license.status.toLowerCase()}`, status: license.status },
        { status: 403, headers: corsHeaders(origin) }
      );
    }

    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      return NextResponse.json(
        { ok: false, error: "License key has expired", expired: true },
        { status: 403, headers: corsHeaders(origin) }
      );
    }

    // Check registered device count against deviceLimit
    const existingDevice = license.devices.find((d) => d.hwFingerprint === rawDeviceId);
    if (!existingDevice) {
      if (license.devices.length >= license.deviceLimit) {
        return NextResponse.json(
          {
            ok: false,
            error: `Maximum device limit (${license.deviceLimit}) reached for this license key`,
            deviceConflict: true,
          },
          { status: 403, headers: corsHeaders(origin) }
        );
      }

      // Register new device
      try {
        await prisma.device.create({
          data: {
            licenseId: license.id,
            os: "OTHER",
            hwFingerprint: rawDeviceId,
          },
        });
      } catch {
        // Device registration fallback
      }
    }

    const isTrial = license.type === "TRIAL";

    return NextResponse.json(
      {
        ok: true,
        kind: isTrial ? "free" : "pro",
        unlimited: !isTrial,
        remaining: 1000,
        license: {
          id: license.id,
          licenseKey: license.licenseKey,
          type: license.type,
          status: license.status,
          product: license.product.name,
          deviceLimit: license.deviceLimit,
          registeredDevices: license.devices.length + (existingDevice ? 0 : 1),
        },
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error: any) {
    console.error("POST /api/licenses/validate Error:", error);
    return NextResponse.json(
      { ok: false, error: "Validation server error", message: error.message },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}
