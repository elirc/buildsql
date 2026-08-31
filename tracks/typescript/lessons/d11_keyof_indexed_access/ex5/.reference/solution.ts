// d11_keyof_indexed_access / ex5 - reference solution (author only).

export function pluckNested<T, K extends keyof T, I extends keyof T[K]>(
  items: readonly T[],
  outer: K,
  inner: I,
): T[K][I][] {
  return items.map((item) => item[outer][inner]);
}
