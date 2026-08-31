// d11_keyof_indexed_access / ex1 - reference solution (author only).

export function getValue<T, K extends keyof T>(source: T, key: K): T[K] {
  return source[key];
}
