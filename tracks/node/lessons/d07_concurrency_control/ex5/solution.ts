// d07_concurrency_control / ex5 - a limiter that reports instead of failing.
// See lessons/d07_concurrency_control/README.md, "Problem 5".

export type Settled<R> =
  | { status: "fulfilled"; value: R }
  | { status: "rejected"; reason: unknown };

/**
 * Never more than `limit` workers in flight; a slot frees the moment one
 * settles, whichever way. One record per input, in INPUT order, and the call
 * itself never rejects.
 */
export async function mapSettledLimit<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<Settled<R>[]> {
  throw new Error("ex5: mapSettledLimit() is not implemented yet - edit this file.");
}
