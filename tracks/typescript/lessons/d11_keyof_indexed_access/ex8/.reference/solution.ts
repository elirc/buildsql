// d11_keyof_indexed_access / ex8 - reference solution (author only).

export interface SortKey<T> {
  key: keyof T;
  direction: "asc" | "desc";
}

function compareValues(left: unknown, right: unknown): number {
  if (left === right) {
    return 0;
  }
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  return String(left) < String(right) ? -1 : 1;
}

export function sortRows<T>(rows: readonly T[], by: readonly SortKey<T>[]): T[] {
  return [...rows].sort((a, b) => {
    for (const { key, direction } of by) {
      const order = compareValues(a[key], b[key]);
      if (order !== 0) {
        return direction === "asc" ? order : -order;
      }
    }
    return 0;
  });
}
