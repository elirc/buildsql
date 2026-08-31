// d09_generic_functions / ex6 - a wrapper that keeps the signature it wraps.
// See lessons/d09_generic_functions/README.md, "ex6".
//
// The returned function has lost its result type.

export function memoize<A, R>(
  fn: (arg: A) => R,
  keyOf: (arg: A) => string,
): (arg: A) => unknown {
  throw new Error("ex6: memoize() is not implemented yet - edit this file.");
}
