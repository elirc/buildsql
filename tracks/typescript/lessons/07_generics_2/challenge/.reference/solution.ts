// 07_generics_2 / challenge - reference solution (author only).

export function getIn<T, K1 extends keyof T, K2 extends keyof T[K1]>(
  source: T,
  first: K1,
  second: K2,
): T[K1][K2] {
  return source[first][second];
}
