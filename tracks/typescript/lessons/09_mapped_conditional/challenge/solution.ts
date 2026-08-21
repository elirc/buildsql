// 09_mapped_conditional / challenge - recursion, at the type level.
// See lessons/09_mapped_conditional/README.md, "Challenge".

export type DeepReadonly<T> = T;

export function deepFreeze<T extends object>(value: T): DeepReadonly<T> {
  throw new Error("challenge: deepFreeze() is not implemented yet - edit this file.");
}
