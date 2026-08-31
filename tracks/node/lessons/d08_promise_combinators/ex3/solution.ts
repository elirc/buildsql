// d08_promise_combinators / ex3 - write Promise.any.
// See lessons/d08_promise_combinators/README.md, "Problem 3".
//
// Do not call Promise.any.

/**
 * Resolve with the first input to FULFIL, ignoring rejections. If every input
 * rejects, reject with an `AggregateError` whose `.errors` holds every reason
 * in INPUT order. An empty array rejects immediately, with no errors in it.
 */
export function anyOf<T>(promises: readonly Promise<T>[]): Promise<T> {
  throw new Error("ex3: anyOf() is not implemented yet - edit this file.");
}
