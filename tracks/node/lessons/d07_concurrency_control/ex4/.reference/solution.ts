// d07_concurrency_control / ex4 - reference solution (author only, used by `dojo verify`).

export async function batched<T, R>(
  items: readonly T[],
  size: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];

  for (let start = 0; start < items.length; start += size) {
    const group = items.slice(start, start + size);
    // The map starts every worker in the group; the await is the barrier that
    // makes the NEXT group wait for all of them.
    const settled = await Promise.all(
      group.map((item, offset) => worker(item, start + offset)),
    );
    results.push(...settled);
  }

  return results;
}
