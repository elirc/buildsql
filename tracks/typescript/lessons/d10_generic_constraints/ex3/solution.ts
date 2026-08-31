// d10_generic_constraints / ex3 - a constraint that preserves literals.
// See lessons/d10_generic_constraints/README.md, "ex3".
//
// The return type has widened the buckets to "any string at all".

export function tally<K extends string>(
  keys: readonly K[],
  values: readonly string[],
): Record<string, number> {
  throw new Error("ex3: tally() is not implemented yet - edit this file.");
}
