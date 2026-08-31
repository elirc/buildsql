// d12_builtin_utilities / ex3 - NonNullable<T>.
// See lessons/d12_builtin_utilities/README.md, "ex3".
//
// The return type still admits the two members this function skips.

export function firstDefined<T>(values: readonly (T | null | undefined)[]): T | undefined {
  throw new Error("ex3: firstDefined() is not implemented yet - edit this file.");
}
