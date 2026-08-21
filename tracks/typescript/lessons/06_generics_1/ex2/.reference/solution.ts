// 06_generics_1 / ex2 - reference solution (author only).

export function mapArray<T, U>(
  items: readonly T[],
  transform: (item: T, index: number) => U,
): U[] {
  const result: U[] = [];
  for (let i = 0; i < items.length; i++) {
    result.push(transform(items[i], i));
  }
  return result;
}
