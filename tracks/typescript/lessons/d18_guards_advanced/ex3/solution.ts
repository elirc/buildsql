// d18_guards_advanced / ex3 - narrow a string to a list.
// See lessons/d18_guards_advanced/README.md, "ex3".
//
// The stub is a boolean-returning shell, so the compiler keeps
// treating the checked string as a string.

export function isOneOf<T extends string>(allowed: readonly T[], value: string): boolean {
  throw new Error("ex3: isOneOf() is not implemented yet - edit this file.");
}
