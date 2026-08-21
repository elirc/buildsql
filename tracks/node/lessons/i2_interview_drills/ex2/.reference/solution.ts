// i2_interview_drills / ex2 - reference solution (author only, used by `dojo verify`).

export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  let failed = false;

  const runner = async (): Promise<void> => {
    while (next < items.length && !failed) {
      const index = next;
      next += 1;
      try {
        results[index] = await worker(items[index], index);
      } catch (error) {
        failed = true; // stop the other runners from picking up more work
        throw error;
      }
    }
  };

  const size = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: size }, () => runner()));
  return results;
}
