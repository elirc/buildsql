// 06_generics_1 / ex3 - a generic interface, and a method with its own type.
// See lessons/06_generics_1/README.md, "Exercise 3".
//
// Box holds one value. It should hold one value *of a type the caller
// chooses*, and map() should be able to change that type.

export interface Box {
  readonly value: unknown;
}

export function box(value: unknown): Box {
  throw new Error("ex3: box() is not implemented yet - edit this file.");
}
