// 07_generics_2 / ex2 - reference solution (author only).

export function longest<T extends { length: number }>(a: T, b: T): T {
  return b.length > a.length ? b : a;
}
