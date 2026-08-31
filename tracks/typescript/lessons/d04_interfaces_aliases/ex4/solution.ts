// d04_interfaces_aliases / ex4 - a named member beside an index signature.
// See lessons/d04_interfaces_aliases/README.md, "ex4".
//
// The index signature says the counts might be anything. They are counts.

export interface OpeningStats {
  total: number;
  [opening: string]: unknown;
}

export function topOpening(stats: OpeningStats): string {
  throw new Error("ex4: topOpening() is not implemented yet - edit this file.");
}
