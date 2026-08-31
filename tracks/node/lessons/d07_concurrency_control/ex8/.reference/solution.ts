// d07_concurrency_control / ex8 - reference solution (author only, used by `dojo verify`).

export async function mapLimitAbortable<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number, signal: AbortSignal) => Promise<R>,
  signal: AbortSignal,
): Promise<R[]> {
  // Check before anything: an already-aborted signal must not start work.
  if (signal.aborted) throw signal.reason;

  const results = new Array<R>(items.length);
  let next = 0;

  let onAbort!: () => void;
  const aborted = new Promise<never>((_resolve, reject) => {
    onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
  });
  // Nobody may ever look at this promise; make sure that is not a crash.
  aborted.catch(() => {});

  const runner = async (): Promise<void> => {
    // Re-checked every lap, so an abort stops the SCHEDULING immediately even
    // though the work already in flight cannot be un-started.
    while (!signal.aborted) {
      const index = next;
      next += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index, signal);
    }
  };

  const runners = Array.from({ length: Math.min(limit, items.length) }, () => runner());

  try {
    // Whichever happens first: all the work, or the cancellation.
    await Promise.race([Promise.all(runners), aborted]);
    return results;
  } finally {
    signal.removeEventListener("abort", onAbort);
  }
}
