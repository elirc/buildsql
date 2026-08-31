// d06_async_await / ex6 - mapping the values of an object, concurrently.
// See lessons/d06_async_await/README.md, "Problem 6".

/**
 * Apply `fn` to every value, all at once, and rebuild the object with the same
 * keys. One rejection rejects the whole call.
 */
export async function mapValuesAsync<T, R>(
  record: Record<string, T>,
  fn: (value: T, key: string) => Promise<R>,
): Promise<Record<string, R>> {
  throw new Error("ex6: mapValuesAsync() is not implemented yet - edit this file.");
}
