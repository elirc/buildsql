// 07_generics_2 / ex1 - reference solution (author only).

export function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}
