// d11_keyof_indexed_access / ex2 - write one member without mutating.
// See lessons/d11_keyof_indexed_access/README.md, "ex2".
//
// `unknown` as the value type lets a caller put a string where a number lives.

export function setValue<T, K extends keyof T>(source: T, key: K, value: unknown): T {
  throw new Error("ex2: setValue() is not implemented yet - edit this file.");
}
