import { NextResponse } from "next/server";
import { LicenseService } from "@/services/license.service";

/**
 * DELETE: Flush/reset all hardware device binds for a license key
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await LicenseService.resetDevices(id);
    return NextResponse.json({ success: true, message: "DEVICES_FLUSHED" });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
