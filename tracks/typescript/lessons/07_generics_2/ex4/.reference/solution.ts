// 07_generics_2 / ex4 - reference solution (author only).

export function indexBy<T, K extends keyof T>(items: readonly T[], key: K): Map<T[K], T> {
  const index = new Map<T[K], T>();
  for (const item of items) {
    index.set(item[key], item);
  }
  return index;
}
