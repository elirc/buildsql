// d24_mixed_gauntlet / ex2 - reference solution (author only).

export const RANKS = { bronze: 1, silver: 2, gold: 3 } as const satisfies Record<string, number>;

export type RankName = keyof typeof RANKS;

export type RankValue = (typeof RANKS)[RankName];

export function isHigher(a: RankName, b: RankName): boolean {
  return RANKS[a] > RANKS[b];
}

export function namesAbove(name: RankName): RankName[] {
  const names = Object.keys(RANKS) as RankName[];
  return names
    .filter((candidate) => RANKS[candidate] > RANKS[name])
    .sort((left, right) => RANKS[left] - RANKS[right]);
}
