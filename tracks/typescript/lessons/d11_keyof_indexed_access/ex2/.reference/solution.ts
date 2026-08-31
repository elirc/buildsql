// d11_keyof_indexed_access / ex2 - reference solution (author only).

export function setValue<T, K extends keyof T>(source: T, key: K, value: T[K]): T {
  return { ...source, [key]: value } as T;
}
