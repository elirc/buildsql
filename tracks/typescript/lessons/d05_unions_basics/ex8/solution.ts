// d05_unions_basics / ex8 - fold a column of cells into one label.
// See lessons/d05_unions_basics/README.md, "ex8".
//
// ColumnKind should be a closed set of five labels, not "any string at all".

export type Cell = string | number | boolean | null;

export type ColumnKind = string;

export function columnKinds(rows: readonly (readonly Cell[])[]): ColumnKind[] {
  throw new Error("ex8: columnKinds() is not implemented yet - edit this file.");
}
