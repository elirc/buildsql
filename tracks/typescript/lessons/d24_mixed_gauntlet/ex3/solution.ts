// d24_mixed_gauntlet / ex3 - a mapped type with a condition in it.
// See lessons/d24_mixed_gauntlet/README.md, "ex3".
//
// The stub maps every member to itself, which is a very careful
// way of doing nothing.

export type Stringified<T> = { [K in keyof T]: T[K] };

export function stringifyNumbers<T extends Record<string, unknown>>(value: T): Stringified<T> {
  throw new Error("ex3: stringifyNumbers() is not implemented yet - edit this file.");
}
