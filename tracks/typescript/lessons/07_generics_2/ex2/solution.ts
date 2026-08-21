// 07_generics_2 / ex2 - a constraint that demands structure.
// See lessons/07_generics_2/README.md, "Exercise 2".
//
// T is unconstrained here, so nothing guarantees the arguments have a length.

export function longest<T>(a: T, b: T): T {
  throw new Error("ex2: longest() is not implemented yet - edit this file.");
}
