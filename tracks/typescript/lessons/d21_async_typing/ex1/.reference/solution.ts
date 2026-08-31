// d21_async_typing / ex1 - reference solution (author only).

export async function mapSeries<T, R>(
  values: readonly T[],
  fn: (value: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let index = 0; index < values.length; index += 1) {
    results.push(await fn(values[index], index));
  }
  return results;
}
