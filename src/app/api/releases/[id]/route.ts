import { NextResponse } from "next/server";
import { ReleaseService } from "@/services/release.service";

/**
 * DELETE: Remove/rollback a release build by ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await ReleaseService.deleteRelease(id);
    return NextResponse.json({ success: true, message: "RELEASE_DELETED" });
  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
