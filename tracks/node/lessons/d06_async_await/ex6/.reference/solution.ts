// d06_async_await / ex6 - reference solution (author only, used by `dojo verify`).

export async function mapValuesAsync<T, R>(
  record: Record<string, T>,
  fn: (value: T, key: string) => Promise<R>,
): Promise<Record<string, R>> {
  const keys = Object.keys(record);

  // map() calls every fn before Promise.all ever waits, so all of them are in
  // flight together; the array keeps them lined up with `keys` by position.
  const values = await Promise.all(keys.map((key) => fn(record[key], key)));

  return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
}
