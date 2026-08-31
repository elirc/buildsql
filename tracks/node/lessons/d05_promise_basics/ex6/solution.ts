// d05_promise_basics / ex6 - one at a time, on purpose.
// See lessons/d05_promise_basics/README.md, "Problem 6".

/**
 * Run `step` for each item strictly in sequence: item n + 1 does not start
 * until item n has settled. Results come back in input order.
 *
 * A failing step stops the chain and rejects with `step <index> failed`,
 * carrying the original error as `cause`.
 */
export function chainSequential<T, R>(
  items: readonly T[],
  step: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  throw new Error("ex6: chainSequential() is not implemented yet - edit this file.");
}
