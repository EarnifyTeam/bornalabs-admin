export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Role = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "SUPPORT";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";
export type ProductCategory = "AI_TOOL" | "CHROME_EXTENSION" | "DESKTOP_SOFTWARE" | "AUTOMATION" | "API" | "FUTURE_PRODUCT";
export type ProductStatus = "LIVE" | "BETA" | "COMING_SOON" | "DEPRECATED";
export type LicenseType = "FREE" | "TRIAL" | "MONTHLY" | "YEARLY" | "LIFETIME";
export type LicenseStatus = "ACTIVE" | "SUSPENDED" | "BLACKLISTED" | "EXPIRED";
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
          description: string;
          category: ProductCategory;
          price: number;
          isLicenseRequired: boolean;
          status: ProductStatus;
          downloadUrl: string | null;
          documentationUrl: string | null;
          iconUrl: string | null;
          bannerUrl: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          category: ProductCategory;
          price?: number;
          isLicenseRequired?: boolean;
          status?: ProductStatus;
          downloadUrl?: string | null;
          documentationUrl?: string | null;
          iconUrl?: string | null;
          bannerUrl?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string;
          category?: ProductCategory;
          price?: number;
          isLicenseRequired?: boolean;
          status?: ProductStatus;
          downloadUrl?: string | null;
          documentationUrl?: string | null;
          iconUrl?: string | null;
          bannerUrl?: string | null;
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
          expiryDate: string | null;
          activationDate: string | null;
          lastActiveAt: string | null;
          deviceLimit: number;
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
          expiryDate?: string | null;
          activationDate?: string | null;
          lastActiveAt?: string | null;
          deviceLimit?: number;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          type?: LicenseType;
          status?: LicenseStatus;
          expiryDate?: string | null;
          deviceLimit?: number;
          lastActiveAt?: string | null;
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
