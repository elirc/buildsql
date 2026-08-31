// d24_mixed_gauntlet / ex2 - a frozen table, read three ways.
// See lessons/d24_mixed_gauntlet/README.md, "ex2".
//
// The stub annotates the table, so both derived types collapse
// and every string becomes a valid rank.

export const RANKS: Record<string, number> = { bronze: 1, silver: 2, gold: 3 };

export type RankName = keyof typeof RANKS;

export type RankValue = (typeof RANKS)[RankName];

export function isHigher(a: RankName, b: RankName): boolean {
  throw new Error("ex2: isHigher() is not implemented yet - edit this file.");
}

export function namesAbove(name: RankName): RankName[] {
  throw new Error("ex2: namesAbove() is not implemented yet - edit this file.");
}
