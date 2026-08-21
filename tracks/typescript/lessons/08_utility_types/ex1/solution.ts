// 08_utility_types / ex1 - Partial<T>, where a patch is not a whole object.
// See lessons/08_utility_types/README.md, "Exercise 1".
//
// The patch parameter currently demands every property. It should demand none
// of them.

export function applyPatch<T extends object>(base: T, patch: T): T {
  throw new Error("ex1: applyPatch() is not implemented yet - edit this file.");
}
