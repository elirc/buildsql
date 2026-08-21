// 07_generics_2 / review1 - reference solution (author only).

export function firstWith<T, K extends keyof T>(
  items: readonly T[],
  key: K,
  value: T[K],
): T | undefined {
  return items.find((item) => item[key] === value);
}
