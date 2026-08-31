// d05_unions_basics / ex8 - reference solution (author only).

export type Cell = string | number | boolean | null;

export type ColumnKind = "empty" | "string" | "number" | "boolean" | "mixed";

export function columnKinds(rows: readonly (readonly Cell[])[]): ColumnKind[] {
  let width = 0;
  for (const row of rows) {
    if (row.length > width) {
      width = row.length;
    }
  }

  const kinds: ColumnKind[] = [];
  for (let column = 0; column < width; column += 1) {
    let kind: ColumnKind = "empty";
    for (const row of rows) {
      const cell = column < row.length ? row[column] : null;
      if (cell === null) {
        continue;
      }
      const seen: ColumnKind =
        typeof cell === "string" ? "string" : typeof cell === "number" ? "number" : "boolean";
      if (kind === "empty") {
        kind = seen;
      } else if (kind !== seen) {
        kind = "mixed";
      }
    }
    kinds.push(kind);
  }
  return kinds;
}
