// d06_async_await / ex5 - consuming an async iterable, and letting go of it.
// See lessons/d06_async_await/README.md, "Problem 5".

/**
 * Add up the values from `source` until one equals `stopAt`. The sentinel is
 * not counted, and leaving early must close the iterator.
 */
export async function sumUntil(
  source: AsyncIterable<number>,
  stopAt: number,
): Promise<number> {
  throw new Error("ex5: sumUntil() is not implemented yet - edit this file.");
}
