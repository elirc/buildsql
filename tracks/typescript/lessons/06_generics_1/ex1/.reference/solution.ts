// 06_generics_1 / ex1 - reference solution (author only).

export function first<T>(items: readonly T[]): T | undefined {
  return items.length === 0 ? undefined : items[0];
}
