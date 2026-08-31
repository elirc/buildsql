// d11_keyof_indexed_access / ex7 - select columns from rows.
// See lessons/d11_keyof_indexed_access/README.md, "ex7".
//
// Returning T[] promises every member of every row. Promise less.

export function project<T extends object, K extends keyof T>(
  rows: readonly T[],
  keys: readonly K[],
): T[] {
  throw new Error("ex7: project() is not implemented yet - edit this file.");
}
