// d20_satisfies_asconst / ex7 - derive two unions from one table.
// See lessons/d20_satisfies_asconst/README.md, "ex7".
//
// The stub annotates the table, so the keys widen to string and
// both derived types collapse to string.

export const PLANS: Record<string, { seats: number; features: readonly string[] }> = {
  free: { seats: 1, features: ["basic"] },
  pro: { seats: 10, features: ["basic", "api"] },
  scale: { seats: 100, features: ["basic", "api", "sso"] },
};

export type PlanName = keyof typeof PLANS;

export type Feature = (typeof PLANS)[PlanName]["features"][number];
