// d06_async_await / ex2 - when sequential is the wrong answer.
// See lessons/d06_async_await/README.md, "Problem 2".

/**
 * Start both pieces of work before waiting for either, and return their results
 * as a tuple in argument order. One rejection rejects the pair.
 */
export async function startBoth<A, B>(
  first: () => Promise<A>,
  second: () => Promise<B>,
): Promise<[A, B]> {
  throw new Error("ex2: startBoth() is not implemented yet - edit this file.");
}
