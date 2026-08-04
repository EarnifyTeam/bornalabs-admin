import prisma from "@/lib/prisma";
import { ReleaseFileType } from "@prisma/client";

export class ReleaseService {
  /**
   * Log a new application/extension release binary
   */
  static async createRelease(params: {
    productId: string;
    version: string;
    releaseNotes: string;
    fileUrl: string;
    fileType: ReleaseFileType;
    isForceUpdate: boolean;
    supportedBrowsers?: string[];
  }) {
    return await prisma.release.create({
      data: {
        productId: params.productId,
        version: params.version,
        releaseNotes: params.releaseNotes,
        fileUrl: params.fileUrl,
        fileType: params.fileType,
        isForceUpdate: params.isForceUpdate,
        supportedBrowsers: params.supportedBrowsers || [],
      },
    });
  }

  /**
   * Get the latest active release release version for a product slug
   */
  static async getLatestRelease(productSlug: string) {
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      include: {
        releases: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!product || !product.releases.length) {
      return null;
    }

    return product.releases[0];
  }

  /**
   * Check if client requires an update. Returns update trigger status.
   */
  static async checkUpdate(params: {
    productSlug: string;
    currentClientVersion: string;
  }) {
    const product = await prisma.product.findUnique({
      where: { slug: params.productSlug },
      include: {
        releases: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product || !product.releases.length) {
      return { updateRequired: false };
    }

    const latestRelease = product.releases[0];
    
    // Simple direct match update check
    if (latestRelease.version === params.currentClientVersion) {
      return { updateRequired: false };
    }

    // Check if any release version higher than the client version has isForceUpdate true
    const clientReleaseIndex = product.releases.findIndex(
      (r) => r.version === params.currentClientVersion
    );

    let forceUpdate = false;
    if (clientReleaseIndex !== -1) {
      // Loop from latest release (index 0) up to client release index
      for (let i = 0; i < clientReleaseIndex; i++) {
        if (product.releases[i].isForceUpdate) {
          forceUpdate = true;
          break;
        }
      }
    } else {
      // If version is unknown/not found in database, trigger force update if any exist
      forceUpdate = product.releases.some((r) => r.isForceUpdate);
    }

    return {
      updateRequired: true,
      latestVersion: latestRelease.version,
      fileUrl: latestRelease.fileUrl,
      fileType: latestRelease.fileType,
      isForceUpdate: forceUpdate,
      releaseNotes: latestRelease.releaseNotes,
    };
  }

  /**
   * Delete a release log (or triggers rollback)
   */
  static async deleteRelease(releaseId: string) {
    return await prisma.release.delete({
      where: { id: releaseId },
    });
  }
}
