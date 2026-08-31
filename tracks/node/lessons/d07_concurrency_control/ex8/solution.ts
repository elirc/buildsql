// d07_concurrency_control / ex8 - a limiter you can call off.
// See lessons/d07_concurrency_control/README.md, "Problem 8".

/**
 * Map `items` with at most `limit` workers in flight, results in input order.
 *
 * The signal is honoured three ways: an already-aborted signal starts nothing,
 * an abort mid-run starts nothing further and rejects with `signal.reason`
 * straight away, and the signal is passed to each worker so its own work can
 * be cancelled too.
 */
export async function mapLimitAbortable<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number, signal: AbortSignal) => Promise<R>,
  signal: AbortSignal,
): Promise<R[]> {
  throw new Error("ex8: mapLimitAbortable() is not implemented yet - edit this file.");
}
