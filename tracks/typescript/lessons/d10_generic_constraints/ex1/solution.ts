// d10_generic_constraints / ex1 - the smallest constraint that works.
// See lessons/d10_generic_constraints/README.md, "ex1".
//
// `object` has no members at all, so the body cannot read an amount.

export function sumOf<T extends object>(items: readonly T[]): number {
  throw new Error("ex1: sumOf() is not implemented yet - edit this file.");
}
