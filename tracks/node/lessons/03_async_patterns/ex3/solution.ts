// 03_async_patterns / ex3 - concurrency with a ceiling.
// See lessons/03_async_patterns/README.md, "Exercise 3".

export async function mapWithLimit<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  throw new Error("ex3: mapWithLimit() is not implemented yet - edit this file.");
}
