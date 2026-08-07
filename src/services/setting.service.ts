import prisma from "@/lib/prisma";

export class SettingService {
  /**
   * Get a single setting value by key
   */
  static async get(key: string, defaultValue = ""): Promise<string> {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key },
      });
      return setting ? setting.value : defaultValue;
    } catch (error) {
      console.error(`Failed to get setting ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Set/update a setting value
   */
  static async set(key: string, value: string, category: string) {
    return await prisma.setting.upsert({
      where: { key },
      update: { value, category },
      create: { key, value, category },
    });
  }

  /**
   * Get all settings by category as a key-value dictionary
   */
  static async getAllByCategory(category: string): Promise<Record<string, string>> {
    try {
      const settings = await prisma.setting.findMany({
        where: { category },
      });
      const dict: Record<string, string> = {};
      for (const s of settings) {
        dict[s.key] = s.value;
      }
      return dict;
    } catch (error) {
      console.error(`Failed to get settings for category ${category}:`, error);
      return {};
    }
  }

  /**
   * Save multiple settings using a single high-performance SQL upsert batch
   */
  static async setMany(settings: { key: string; value: string; category: string }[]) {
    if (!settings || settings.length === 0) return;

    // Filter out invalid items
    const validSettings = settings.filter((s) => s.key);
    if (validSettings.length === 0) return;

    // Build ultra-fast single multi-row SQL upsert
    const valueTuples = validSettings.map((s, idx) => {
      const safeKey = s.key.replace(/'/g, "''");
      const safeVal = (s.value || "").replace(/'/g, "''");
      const safeCat = (s.category || "GENERAL").replace(/'/g, "''");
      return `('${safeKey}', '${safeVal}', '${safeCat}')`;
    }).join(", ");

    const sql = `
      INSERT INTO "Setting" ("key", "value", "category")
      VALUES ${valueTuples}
      ON CONFLICT ("key")
      DO UPDATE SET
        "value" = EXCLUDED."value",
        "category" = EXCLUDED."category";
    `;

    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err) {
      // Fallback to transaction if raw SQL batch fails
      await prisma.$transaction(
        validSettings.map((s) =>
          prisma.setting.upsert({
            where: { key: s.key },
            update: { value: s.value, category: s.category },
            create: { key: s.key, value: s.value, category: s.category },
          })
        )
      );
    }
  }
}
