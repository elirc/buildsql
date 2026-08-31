// d11_keyof_indexed_access / ex3 - reference solution (author only).

export function valuesOf<T extends object>(source: T): T[keyof T][] {
  return (Object.keys(source) as (keyof T)[]).map((key) => source[key]);
}
