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
    "Cache-Control": "no-store, max-age=0",
    "Vary": "Origin",
  };
};

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return NextResponse.json({}, { headers: corsHeaders(origin) });
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  try {
    const settings = await prisma.setting.findMany({
      where: {
        category: { in: ["extension", "payment", "general"] },
      },
    });

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json(
      {
        success: true,
        developerName: settingsMap.developer_name || "BornaLabs",
        whatsappUrl: settingsMap.whatsapp_link || settingsMap.whatsapp_payment_number || "https://wa.me/919876543210",
        instagramUrl: settingsMap.instagram_link || "https://instagram.com/bornalabs",
        facebookUrl: settingsMap.facebook_link || "https://facebook.com/bornalabs",
      },
      { headers: corsHeaders(origin) }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: true,
        developerName: "BornaLabs",
        whatsappUrl: "https://wa.me/919876543210",
        instagramUrl: "https://instagram.com/bornalabs",
        facebookUrl: "https://facebook.com/bornalabs",
      },
      { headers: corsHeaders(origin) }
    );
  }
}
