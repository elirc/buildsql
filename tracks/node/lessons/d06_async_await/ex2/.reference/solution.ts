// d06_async_await / ex2 - reference solution (author only, used by `dojo verify`).

export async function startBoth<A, B>(
  first: () => Promise<A>,
  second: () => Promise<B>,
): Promise<[A, B]> {
  // Calling is starting. Both calls happen before the first await, so the two
  // waits overlap.
  const a = first();
  const b = second();
  // Promise.all rather than `[await a, await b]`: it attaches handlers to both
  // immediately, so a rejection from the second one while we are waiting on
  // the first is never an unhandled rejection.
  return Promise.all([a, b]);
}
