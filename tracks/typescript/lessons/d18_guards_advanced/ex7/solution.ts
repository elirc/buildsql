// d18_guards_advanced / ex7 - lift a guard over a list.
// See lessons/d18_guards_advanced/README.md, "ex7".
//
// The stub returns a plain boolean-returning function, so a list
// that passes it is still a list of unknowns.

export function everyIs<T, S extends T>(
  guard: (value: T) => value is S,
): (values: readonly T[]) => boolean {
  throw new Error("ex7: everyIs() is not implemented yet - edit this file.");
}
