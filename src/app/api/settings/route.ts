import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET: Retrieve all system configuration settings
 */
export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST: Bulk upsert/save system configurations [Admin only]
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settings } = body; // Array of { key: string, value: string, category: string }

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { error: "SETTINGS_ARRAY_REQUIRED" },
        { status: 400 }
      );
    }

    const upsertPromises = settings.map((item) =>
      prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value, category: item.category },
        create: { key: item.key, value: item.value, category: item.category },
      })
    );

    const savedSettings = await Promise.all(upsertPromises);

    return NextResponse.json({ success: true, settings: savedSettings });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
