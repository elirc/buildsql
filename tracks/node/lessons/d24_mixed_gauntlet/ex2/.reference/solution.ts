// d24_mixed_gauntlet / ex2 - reference solution (author only, used by `dojo verify`).

export interface RetryLimitOptions {
  limit: number;
  retries: number;
  delayFor: (attempt: number) => number;
  sleep: (ms: number) => Promise<void>;
}

export async function retryingLimitedMap<T, R>(
  items: readonly T[],
  worker: (item: T, index: number) => Promise<R>,
  options: RetryLimitOptions,
): Promise<R[]> {
  const { limit, retries, delayFor, sleep } = options;
  const results = new Array<R>(items.length);
  let next = 0;
  //: set by the first item that runs out of attempts; stops the other runners
  //: from taking any more work.
  let failed: unknown = null;

  const runner = async (): Promise<void> => {
    while (failed === null) {
      const index = next;
      if (index >= items.length) return;
      next += 1;

      // The retry loop is INSIDE the slot: nothing else starts while this item
      // is waiting to try again.
      for (let attempt = 1; ; attempt += 1) {
        try {
          results[index] = await worker(items[index], index);
          break;
        } catch (error) {
          if (attempt > retries || failed !== null) {
            failed = error;
            throw error;
          }
          await sleep(delayFor(attempt));
        }
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runner()));
  return results;
}
