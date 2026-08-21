// 09_mapped_conditional / ex2 - renaming keys while you map them.
// See lessons/09_mapped_conditional/README.md, "Exercise 2".

export type Getters<T> = T;

export function makeGetters<T extends object>(source: T): Getters<T> {
  throw new Error("ex2: makeGetters() is not implemented yet - edit this file.");
}
