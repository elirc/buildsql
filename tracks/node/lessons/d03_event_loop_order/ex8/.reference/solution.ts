// d03_event_loop_order / ex8 - reference solution (author only, used by `dojo verify`).

export interface YieldingResult<R> {
  results: R[];
  yields: number;
}

/** A real turn of the loop, not a microtask. */
function yieldToLoop(): Promise<void> {
  return new Promise<void>((resolve) => setImmediate(resolve));
}

export async function yieldingMap<T, R>(
  items: readonly T[],
  size: number,
  fn: (item: T, index: number) => R,
): Promise<YieldingResult<R>> {
  const results: R[] = [];
  let yields = 0;

  for (let start = 0; start < items.length; start += size) {
    // Yield *before* every chunk except the first: that puts the gaps between
    // chunks rather than after the last one.
    if (start > 0) {
      await yieldToLoop();
      yields += 1;
    }
    const end = Math.min(start + size, items.length);
    for (let i = start; i < end; i += 1) {
      results.push(fn(items[i], i));
    }
  }

  return { results, yields };
}
