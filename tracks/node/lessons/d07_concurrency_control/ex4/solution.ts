// d07_concurrency_control / ex4 - batches, which are not limits.
// See lessons/d07_concurrency_control/README.md, "Problem 4".

/**
 * Process `items` in groups of `size`. Everything in a group runs together;
 * group n + 1 does not start until every member of group n has settled.
 * Results come back flat, in input order. One failure fails the call and no
 * later group starts.
 */
export async function batched<T, R>(
  items: readonly T[],
  size: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  throw new Error("ex4: batched() is not implemented yet - edit this file.");
}
