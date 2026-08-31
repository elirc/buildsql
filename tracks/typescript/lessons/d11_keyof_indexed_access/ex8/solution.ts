// d11_keyof_indexed_access / ex8 - keyof inside a generic interface.
// See lessons/d11_keyof_indexed_access/README.md, "ex8".
//
// `key: string` accepts a typo. It should accept only a real key of T.

export interface SortKey<T> {
  key: string;
  direction: "asc" | "desc";
}

export function sortRows<T>(rows: readonly T[], by: readonly SortKey<T>[]): unknown[] {
  throw new Error("ex8: sortRows() is not implemented yet - edit this file.");
}
