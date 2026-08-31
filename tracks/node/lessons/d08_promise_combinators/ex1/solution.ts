// d08_promise_combinators / ex1 - write Promise.all.
// See lessons/d08_promise_combinators/README.md, "Problem 1".
//
// Do not call Promise.all. The point is the mechanism.

/**
 * Resolve with every value, in INPUT order. An empty array resolves
 * immediately; the first rejection rejects the result with that reason,
 * without waiting for the rest.
 */
export function allInOrder<T>(promises: readonly Promise<T>[]): Promise<T[]> {
  throw new Error("ex1: allInOrder() is not implemented yet - edit this file.");
}
