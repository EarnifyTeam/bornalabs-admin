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
   * Save multiple settings inside a database transaction
   */
  static async setMany(settings: { key: string; value: string; category: string }[]) {
    return await prisma.$transaction(
      settings.map((s) =>
        prisma.setting.upsert({
          where: { key: s.key },
          update: { value: s.value, category: s.category },
          create: { key: s.key, value: s.value, category: s.category },
        })
      )
    );
  }
}
