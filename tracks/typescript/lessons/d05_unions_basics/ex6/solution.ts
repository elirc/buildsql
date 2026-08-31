// d05_unions_basics / ex6 - nullish is not the same as falsy.
// See lessons/d05_unions_basics/README.md, "ex6".
//
// The return type still admits the members this function removes.

export function compact(values: readonly (string | null | undefined)[]): (
  | string
  | null
  | undefined
)[] {
  throw new Error("ex6: compact() is not implemented yet - edit this file.");
}
