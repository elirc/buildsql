// 08_utility_types / challenge - Omit, from scratch, plus the runtime half.
// See lessons/08_utility_types/README.md, "Challenge".

export type MyOmit<T, K extends keyof T> = T;

export function omitKeys<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): MyOmit<T, K> {
  throw new Error("challenge: omitKeys() is not implemented yet - edit this file.");
}
