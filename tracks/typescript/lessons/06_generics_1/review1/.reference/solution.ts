// 06_generics_1 / review1 - reference solution (author only).

export function lastOr<T>(items: readonly T[], fallback: T): T {
  return items.length === 0 ? fallback : items[items.length - 1];
}
