// 03_objects_interfaces / ex3 - an object used as a lookup table.
// See lessons/03_objects_interfaces/README.md, "Exercise 3".
//
// `Tally` currently describes one fixed property. It needs to describe any
// number of them, with keys nobody knows in advance.

export interface Tally {
  total: number;
}

export function countAttempts(slugs: readonly string[]): Tally {
  throw new Error("ex3: countAttempts() is not implemented yet - edit this file.");
}
