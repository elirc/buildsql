// d05_unions_basics / ex4 - narrow once, keep the result.
// See lessons/d05_unions_basics/README.md, "ex4".
//
// The return type still carries the union on both sides. After the guard you
// know more than that.

export function splitCells(values: readonly (string | number)[]): {
  texts: (string | number)[];
  numbers: (string | number)[];
} {
  throw new Error("ex4: splitCells() is not implemented yet - edit this file.");
}
