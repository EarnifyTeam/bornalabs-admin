import prisma from "@/lib/prisma";
import { LicenseType, LicenseStatus } from "@prisma/client";

export class LicenseService {
  /**
   * Generate a random license key with prefix and format
   */
  static generateLicenseKey(prefix: string): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let keySegment = "";
    for (let i = 0; i < 16; i++) {
      keySegment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const formatted = keySegment.match(/.{1,4}/g)?.join("-") || keySegment;
    return `BL-${prefix.toUpperCase()}-${formatted}`;
  }

  /**
   * Create a new license key in database
   */
  static async createLicense(params: {
    userId: string;
    productId: string;
    type: LicenseType;
    prefix: string;
    deviceLimit: number;
    validDays?: number;
  }) {
    const licenseKey = this.generateLicenseKey(params.prefix);
    const expiryDate = params.validDays 
      ? new Date(Date.now() + params.validDays * 24 * 60 * 60 * 1000) 
      : null;

    return await prisma.license.create({
      data: {
        licenseKey,
        userId: params.userId,
        productId: params.productId,
        type: params.type,
        prefix: params.prefix.toUpperCase(),
        deviceLimit: params.deviceLimit,
        expiryDate,
        status: "ACTIVE",
      },
    });
  }

  /**
   * Validate and verify license key against hardware fingerprint bind
   */
  static async verifyLicense(params: {
    licenseKey: string;
    hwFingerprint: string;
    os: any;
    osVersion?: string;
    browser?: any;
    browserVersion?: string;
    clientVersion?: string;
  }) {
    const license = await prisma.license.findUnique({
      where: { licenseKey: params.licenseKey },
      include: { devices: true, product: true },
    });

    if (!license) {
      return { success: false, error: "LICENSE_NOT_FOUND" };
    }

    if (license.status !== "ACTIVE") {
      return { success: false, error: `LICENSE_${license.status}` };
    }

    if (license.expiryDate && new Date() > license.expiryDate) {
      // Update license status in db to EXPIRED
      await prisma.license.update({
        where: { id: license.id },
        data: { status: "EXPIRED" },
      });
      return { success: false, error: "LICENSE_EXPIRED" };
    }

    // Check if hardware fingerprint is already registered
    const existingDevice = license.devices.find(
      (d) => d.hwFingerprint === params.hwFingerprint
    );

    if (existingDevice) {
      // Update device lastActiveAt and license lastActiveAt
      await prisma.device.update({
        where: { id: existingDevice.id },
        data: { lastActiveAt: new Date() },
      });
      await prisma.license.update({
        where: { id: license.id },
        data: { lastActiveAt: new Date() },
      });
      return { success: true, license, device: existingDevice };
    }

    // If new device, verify if under the capacity limit
    if (license.devices.length >= license.deviceLimit) {
      return { success: false, error: "DEVICE_LIMIT_REACHED" };
    }

    // Register new device
    const newDevice = await prisma.device.create({
      data: {
        licenseId: license.id,
        os: params.os,
        osVersion: params.osVersion,
        browser: params.browser,
        browserVersion: params.browserVersion,
        clientVersion: params.clientVersion,
        hwFingerprint: params.hwFingerprint,
      },
    });

    // Update activationDate if this is the first activation
    const activationDateUpdate = !license.activationDate ? { activationDate: new Date() } : {};

    await prisma.license.update({
      where: { id: license.id },
      data: {
        lastActiveAt: new Date(),
        ...activationDateUpdate,
      },
    });

    return { success: true, license, device: newDevice };
  }

  /**
   * Suspend or revoke a license key
   */
  static async suspendLicense(licenseId: string, status: LicenseStatus) {
    return await prisma.license.update({
      where: { id: licenseId },
      data: { status },
    });
  }

  /**
   * Clear all registered devices from a license (reset limits)
   */
  static async resetDevices(licenseId: string) {
    return await prisma.device.deleteMany({
      where: { licenseId },
    });
  }
}
