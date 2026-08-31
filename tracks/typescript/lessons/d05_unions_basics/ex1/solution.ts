// d05_unions_basics / ex1 - two members, two different measurements.
// See lessons/d05_unions_basics/README.md, "ex1".
//
// The parameter union below has a member this function never handles.

export function cellWidth(value: string | number | boolean): number {
  throw new Error("ex1: cellWidth() is not implemented yet - edit this file.");
}
