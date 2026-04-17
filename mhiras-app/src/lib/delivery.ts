export interface DeliveryZoneLike {
  id: string;
  name: string;
  states: string;
  fee: number;
  estimateDays: string;
}

export interface DeliveryMatch {
  id: string;
  name: string;
  fee: number;
  estimateDays: string;
}

/**
 * Find the cheapest zone that covers the given state.
 * Handles inputs like "Abuja (FCT)" by tokenizing on parens.
 * Pure function — callable from server or client.
 */
export function matchZoneForState(
  state: string,
  zones: DeliveryZoneLike[]
): DeliveryMatch | null {
  if (!state?.trim()) return null;

  const tokens = state
    .split(/[()]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  let best: DeliveryMatch | null = null;
  for (const zone of zones) {
    const zoneStates = zone.states
      .split(",")
      .map((s) => s.trim().toLowerCase());
    const matches = tokens.some((t) => zoneStates.includes(t));
    if (!matches) continue;

    if (!best || zone.fee < best.fee) {
      best = {
        id: zone.id,
        name: zone.name,
        fee: zone.fee,
        estimateDays: zone.estimateDays,
      };
    }
  }

  return best;
}
