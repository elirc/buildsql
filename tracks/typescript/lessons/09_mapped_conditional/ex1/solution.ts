// 09_mapped_conditional / ex1 - a mapped type that removes a modifier.
// See lessons/09_mapped_conditional/README.md, "Exercise 1".

export type Mutable<T> = T;

export function thaw<T extends object>(frozen: T): Mutable<T> {
  throw new Error("ex1: thaw() is not implemented yet - edit this file.");
}
