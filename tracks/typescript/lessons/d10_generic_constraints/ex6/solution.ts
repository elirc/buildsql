// d10_generic_constraints / ex6 - constrain the type the callback produces.
// See lessons/d10_generic_constraints/README.md, "ex6".
//
// The Map has forgotten what it holds.

export function groupToMap<T, G extends string | number>(
  items: readonly T[],
  groupOf: (item: T) => G,
): Map<G, unknown[]> {
  throw new Error("ex6: groupToMap() is not implemented yet - edit this file.");
}
