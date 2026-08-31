// d24_mixed_gauntlet / ex2 - a limiter, a retry policy and a clock you own.
// See lessons/d24_mixed_gauntlet/README.md, "Problem 2".

export interface RetryLimitOptions {
  /** Items in flight at once. A retrying item still holds its slot. */
  limit: number;
  /** Extra attempts after the first one. */
  retries: number;
  /** Milliseconds to wait before retry `attempt` (1 is the first retry). */
  delayFor: (attempt: number) => number;
  /** Injected so the gate never waits on a real timer. */
  sleep: (ms: number) => Promise<void>;
}

/**
 * Map `items` through `worker` with at most `limit` in flight, retrying a
 * failing item inside its own slot. Results are in input order; an item that
 * runs out of attempts fails the whole call and nothing further is started.
 */
export async function retryingLimitedMap<T, R>(
  items: readonly T[],
  worker: (item: T, index: number) => Promise<R>,
  options: RetryLimitOptions,
): Promise<R[]> {
  throw new Error("ex2: retryingLimitedMap() is not implemented yet - edit this file.");
}
