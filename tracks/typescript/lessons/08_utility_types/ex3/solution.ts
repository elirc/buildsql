// 08_utility_types / ex3 - write two utility types yourself.
// See lessons/08_utility_types/README.md, "Exercise 3".
//
// Both aliases are placeholders. Implement them as mapped types, then use
// MyPick for the return type of pickKeys().

export type MyPartial<T> = T;

export type MyPick<T, K extends keyof T> = T;

export function pickKeys<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): MyPick<T, K> {
  throw new Error("ex3: pickKeys() is not implemented yet - edit this file.");
}
