/**
 * Nigerian states the storefront's address forms support today. Mhiras only
 * ships to a handful of states at launch — this list is intentionally short.
 * Extend as delivery zones expand. Kept in one place so checkout, addresses,
 * and stockpile delivery requests stay in sync.
 */
export const NG_STATES = [
  "Lagos",
  "Abuja (FCT)",
  "Rivers",
  "Oyo",
  "Kano",
  "Ogun",
  "Kaduna",
  "Enugu",
  "Delta",
  "Edo",
] as const;

export type NgState = (typeof NG_STATES)[number];
