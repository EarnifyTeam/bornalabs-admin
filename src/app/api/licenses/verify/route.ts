import { NextResponse } from "next/server";
import { LicenseService } from "@/services/license.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { licenseKey, hwFingerprint, os, osVersion, browser, browserVersion, clientVersion } = body;

    if (!licenseKey || !hwFingerprint || !os) {
      return NextResponse.json(
        { error: "REQUIRED_PARAMS_MISSING" },
        { status: 400 }
      );
    }

    // Call the LicenseService to verify database record and match fingerprints
    const verificationResult = await LicenseService.verifyLicense({
      licenseKey,
      hwFingerprint,
      os,
      osVersion,
      browser,
      browserVersion,
      clientVersion,
    });

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error },
        { status: 403 }
      );
    }

    // Generate validation response
    return NextResponse.json({
      success: true,
      message: "LICENSE_VERIFICATION_SUCCESSFUL",
      payload: {
        licenseId: verificationResult.license?.id,
        productId: verificationResult.license?.productId,
        type: verificationResult.license?.type,
        expiryDate: verificationResult.license?.expiryDate,
        deviceRegistered: verificationResult.device?.id,
        timestamp: new Date().toISOString(),
      },
      // In production, this response segment would be cryptographically signed using BornaLabs Private RSA Key
      signature: "SIGNATURE_GENERATED_BY_BORNALABS_RSA_PRIVATE_KEY",
    });

  } catch (error) {
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
