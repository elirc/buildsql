// 06_generics_1 / ex1 - the same function, for every element type.
// See lessons/06_generics_1/README.md, "Exercise 1".
//
// `unknown` is honest and useless: the caller gets back something they cannot
// do anything with. Make the function remember what it was given.

export function first(items: readonly unknown[]): unknown {
  throw new Error("ex1: first() is not implemented yet - edit this file.");
}
