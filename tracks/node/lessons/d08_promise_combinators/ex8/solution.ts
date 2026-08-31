// d08_promise_combinators / ex8 - a combinator that has to think ahead.
// See lessons/d08_promise_combinators/README.md, "Problem 8".

/**
 * Resolve as soon as `quorum` inputs have fulfilled with the SAME value
 * (compared with Object.is). Rejections are lost votes.
 *
 * Reject with `no quorum` as soon as it becomes impossible - which is not the
 * same as waiting for everything to settle.
 */
export function firstQuorum<T>(
  promises: readonly Promise<T>[],
  quorum: number,
): Promise<T> {
  throw new Error("ex8: firstQuorum() is not implemented yet - edit this file.");
}
