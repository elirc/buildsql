// d11_keyof_indexed_access / ex5 - chain two indexed accesses.
// See lessons/d11_keyof_indexed_access/README.md, "ex5".
//
// The inner key is unconstrained, so nothing stops a caller asking for a member
// that does not exist - and the return type has given up entirely.

export function pluckNested<T, K extends keyof T, I>(
  items: readonly T[],
  outer: K,
  inner: I,
): unknown[] {
  throw new Error("ex5: pluckNested() is not implemented yet - edit this file.");
}
