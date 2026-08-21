// 05_literals_enums / challenge - derive the union from the data.
// See lessons/05_literals_enums/README.md, "Challenge".
//
// Two problems: the object widens to `number` values, and `Tier` is hand
// written when it could be derived from the object's keys.

export const HINT_TIERS = {
  nudge: 1,
  approach: 2,
  almost: 3,
};

export type Tier = string;

export function sortTiers(tiers: readonly Tier[]): Tier[] {
  throw new Error("challenge: sortTiers() is not implemented yet - edit this file.");
}
