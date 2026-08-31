// d24_mixed_gauntlet / ex1 - guards plus generics.
// See lessons/d24_mixed_gauntlet/README.md, "ex1".
//
// The stub returns the wide element type and throws, so the
// narrowing the guard performed is thrown away at the boundary.

export function firstMatching<T, S extends T>(
  values: readonly T[],
  guard: (value: T) => value is S,
): T | undefined {
  throw new Error("ex1: firstMatching() is not implemented yet - edit this file.");
}
