// d03_event_loop_order / ex8 - map a list without blocking the loop.
// See lessons/d03_event_loop_order/README.md, "Problem 8".

export interface YieldingResult<R> {
  results: R[];
  /** how many times the loop was handed back - between chunks, not after the last */
  yields: number;
}

/**
 * Map `items` in chunks of `size`, handing the event loop a full turn between
 * chunks. Results come back in input order.
 */
export async function yieldingMap<T, R>(
  items: readonly T[],
  size: number,
  fn: (item: T, index: number) => R,
): Promise<YieldingResult<R>> {
  throw new Error("ex8: yieldingMap() is not implemented yet - edit this file.");
}
