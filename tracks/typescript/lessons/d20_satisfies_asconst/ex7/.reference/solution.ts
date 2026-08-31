// d20_satisfies_asconst / ex7 - reference solution (author only).

export const PLANS = {
  free: { seats: 1, features: ["basic"] },
  pro: { seats: 10, features: ["basic", "api"] },
  scale: { seats: 100, features: ["basic", "api", "sso"] },
} as const satisfies Record<string, { seats: number; features: readonly string[] }>;

export type PlanName = keyof typeof PLANS;

export type Feature = (typeof PLANS)[PlanName]["features"][number];
