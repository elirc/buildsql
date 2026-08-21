// 09_mapped_conditional / ex4 - distributivity, and how to switch it off.
// See lessons/09_mapped_conditional/README.md, "Exercise 4".
//
// Three type aliases and one function. All three aliases are placeholders.

export type MyExclude<T, U> = T;

export type BoxEach<T> = T[];

export type BoxAll<T> = T[];

export function withoutValues<T extends string, U extends T>(
  values: readonly T[],
  remove: readonly U[],
): MyExclude<T, U>[] {
  throw new Error("ex4: withoutValues() is not implemented yet - edit this file.");
}
