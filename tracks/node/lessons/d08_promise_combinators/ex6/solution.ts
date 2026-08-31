// d08_promise_combinators / ex6 - the first answer that is any good.
// See lessons/d08_promise_combinators/README.md, "Problem 6".

/**
 * Resolve with the first value to arrive that satisfies `predicate`.
 * Rejections and values that fail the predicate are ignored. If every input
 * has settled without a match, reject with `no result matched`.
 */
export function firstMatching<T>(
  promises: readonly Promise<T>[],
  predicate: (value: T) => boolean,
): Promise<T> {
  throw new Error("ex6: firstMatching() is not implemented yet - edit this file.");
}
