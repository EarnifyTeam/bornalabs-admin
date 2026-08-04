import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SettingService } from "@/services/setting.service";

/**
 * GET: Fetch all setting records or settings key-value map
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const whereClause = category ? { category } : {};
    const settings = await prisma.setting.findMany({
      where: whereClause,
    });

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({ success: true, settings, settingsMap });
  } catch (error) {
    console.error("GET /api/settings Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST: Save or update settings list in database transaction
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settings } = body; // Expects array of { key, value, category }

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { error: "SETTINGS_ARRAY_REQUIRED" },
        { status: 400 }
      );
    }

    await SettingService.setMany(settings);
    return NextResponse.json({ success: true, message: "SETTINGS_UPDATED" });
  } catch (error) {
    console.error("POST /api/settings Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
