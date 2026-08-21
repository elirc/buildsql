// 07_generics_2 / ex1 - keyof, and the type at a key.
// See lessons/07_generics_2/README.md, "Exercise 1".
//
// This signature accepts any string as a key and returns unknown values.
// Both halves can be much better.

export function pluck(items: readonly { [key: string]: unknown }[], key: string): unknown[] {
  throw new Error("ex1: pluck() is not implemented yet - edit this file.");
}
