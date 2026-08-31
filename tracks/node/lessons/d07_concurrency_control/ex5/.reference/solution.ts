// d07_concurrency_control / ex5 - reference solution (author only, used by `dojo verify`).

export type Settled<R> =
  | { status: "fulfilled"; value: R }
  | { status: "rejected"; reason: unknown };

export async function mapSettledLimit<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<Settled<R>[]> {
  const results = new Array<Settled<R>>(items.length);
  //: the shared cursor. Reading and bumping it happens with no await in
  //: between, so no two runners can claim the same index.
  let next = 0;

  const runner = async (): Promise<void> => {
    for (;;) {
      const index = next;
      next += 1;
      if (index >= items.length) return;

      try {
        results[index] = { status: "fulfilled", value: await worker(items[index], index) };
      } catch (reason) {
        // Caught, recorded, and the loop carries on - which is what frees the
        // slot for the next item.
        results[index] = { status: "rejected", reason };
      }
    }
  };

  const runners = Array.from({ length: Math.min(limit, items.length) }, () => runner());
  await Promise.all(runners);
  return results;
}
