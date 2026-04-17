import { db } from "@/lib/db";
import { matchZoneForState, type DeliveryMatch } from "@/lib/delivery";

/**
 * Fetch all active delivery zones, ordered by sortOrder.
 */
export async function getDeliveryZones() {
  return db.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Find the cheapest active delivery zone that covers the given state.
 * Returns null if no zone matches.
 */
export async function getDeliveryFeeByState(
  state: string
): Promise<DeliveryMatch | null> {
  if (!state?.trim()) return null;
  const zones = await getDeliveryZones();
  return matchZoneForState(state, zones);
}
