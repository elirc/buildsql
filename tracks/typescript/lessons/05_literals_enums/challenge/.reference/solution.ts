// 05_literals_enums / challenge - reference solution (author only).

export const HINT_TIERS = {
  nudge: 1,
  approach: 2,
  almost: 3,
} as const;

export type Tier = keyof typeof HINT_TIERS;

export function sortTiers(tiers: readonly Tier[]): Tier[] {
  return [...tiers].sort((a, b) => HINT_TIERS[a] - HINT_TIERS[b]);
}
