import { db } from "@/lib/db";

/**
 * Read the singleton store-settings row, creating it with defaults if missing.
 */
export async function getStoreSettings() {
  const existing = await db.storeSettings.findUnique({
    where: { id: "singleton" },
  });
  if (existing) return existing;
  return db.storeSettings.create({ data: { id: "singleton" } });
}
