export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Role = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "SUPPORT";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";
export type ProductCategory = "AI_TOOL" | "CHROME_EXTENSION" | "DESKTOP_SOFTWARE" | "WEB_APPLICATION" | "AUTOMATION" | "API" | "FUTURE_PRODUCT";
export type ProductStatus = "DRAFT" | "COMING_SOON" | "BETA" | "LIVE" | "DEPRECATED";
export type LicenseType = "TRIAL" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME" | "CUSTOM";
export type LicenseStatus = "ACTIVE" | "INACTIVE" | "EXPIRED" | "SUSPENDED" | "REVOKED";
export type ReleaseFileType = "ZIP" | "CRX" | "EXE" | "MSI" | "DMG" | "DEB" | "RPM";

export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string;
          email: string;
          passwordHash: string;
          role: Role;
          status: UserStatus;
          premiumStatus: boolean;
          notes: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          email: string;
          passwordHash?: string;
          role?: Role;
          status?: UserStatus;
          premiumStatus?: boolean;
          notes?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          email?: string;
          passwordHash?: string;
          role?: Role;
          status?: UserStatus;
          premiumStatus?: boolean;
          notes?: string | null;
          updatedAt?: string;
        };
      };
      Profile: {
        Row: {
          id: string;
          userId: string;
          fullName: string;
          avatarUrl: string | null;
          phone: string | null;
        };
        Insert: {
          id?: string;
          userId: string;
          fullName: string;
          avatarUrl?: string | null;
          phone?: string | null;
        };
        Update: {
          fullName?: string;
          avatarUrl?: string | null;
          phone?: string | null;
        };
      };
      Product: {
        Row: {
          id: string;
          name: string;
          slug: string;
          shortDescription: string | null;
          description: string;
          category: ProductCategory;
          productType: ProductCategory;
          version: string;
          price: number;
          isLicenseRequired: boolean;
          status: ProductStatus;
          downloadUrl: string | null;
          documentationUrl: string | null;
          githubUrl: string | null;
          websiteUrl: string | null;
          iconUrl: string | null;
          bannerUrl: string | null;
          galleryImages: string[];
          featured: boolean;
          createdBy: string | null;
          deletedAt: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          shortDescription?: string | null;
          description?: string;
          category: ProductCategory;
          productType?: ProductCategory;
          version?: string;
          price?: number;
          isLicenseRequired?: boolean;
          status?: ProductStatus;
          downloadUrl?: string | null;
          documentationUrl?: string | null;
          githubUrl?: string | null;
          websiteUrl?: string | null;
          iconUrl?: string | null;
          bannerUrl?: string | null;
          galleryImages?: string[];
          featured?: boolean;
          createdBy?: string | null;
          deletedAt?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          shortDescription?: string | null;
          description?: string;
          category?: ProductCategory;
          productType?: ProductCategory;
          version?: string;
          price?: number;
          isLicenseRequired?: boolean;
          status?: ProductStatus;
          downloadUrl?: string | null;
          documentationUrl?: string | null;
          githubUrl?: string | null;
          websiteUrl?: string | null;
          iconUrl?: string | null;
          bannerUrl?: string | null;
          galleryImages?: string[];
          featured?: boolean;
          createdBy?: string | null;
          deletedAt?: string | null;
          updatedAt?: string;
        };
      };
      License: {
        Row: {
          id: string;
          licenseKey: string;
          userId: string;
          productId: string;
          type: LicenseType;
          prefix: string;
          status: LicenseStatus;
          deviceLimit: number;
          currentDevices: number;
          issuedAt: string;
          expiresAt: string | null;
          lastUsedAt: string | null;
          notes: string | null;
          createdBy: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          licenseKey: string;
          userId: string;
          productId: string;
          type?: LicenseType;
          prefix: string;
          status?: LicenseStatus;
          deviceLimit?: number;
          currentDevices?: number;
          issuedAt?: string;
          expiresAt?: string | null;
          lastUsedAt?: string | null;
          notes?: string | null;
          createdBy?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          type?: LicenseType;
          status?: LicenseStatus;
          deviceLimit?: number;
          currentDevices?: number;
          expiresAt?: string | null;
          lastUsedAt?: string | null;
          notes?: string | null;
          updatedAt?: string;
        };
      };
      Setting: {
        Row: {
          key: string;
          value: string;
          category: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          key: string;
          value: string;
          category: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          value?: string;
          category?: string;
          updatedAt?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      Role: Role;
      UserStatus: UserStatus;
      ProductCategory: ProductCategory;
      ProductStatus: ProductStatus;
      LicenseType: LicenseType;
      LicenseStatus: LicenseStatus;
      ReleaseFileType: ReleaseFileType;
    };
  };
}
