// 09_mapped_conditional / ex3 - a conditional type that infers.
// See lessons/09_mapped_conditional/README.md, "Exercise 3".

export type ElementOf<T> = T;

export function flattenOnce<T>(items: readonly T[]): ElementOf<T>[] {
  throw new Error("ex3: flattenOnce() is not implemented yet - edit this file.");
}
