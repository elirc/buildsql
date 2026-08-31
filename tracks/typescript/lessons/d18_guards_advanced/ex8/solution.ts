// d18_guards_advanced / ex8 - a guard built from a shape.
// See lessons/d18_guards_advanced/README.md, "ex8".
//
// The stub returns a plain predicate-free guard, so nothing is
// narrowed and nothing runs.

export type Guard<T> = (value: unknown) => value is T;

export function objectOf<S extends Record<string, (value: unknown) => boolean>>(
  shape: S,
): (value: unknown) => boolean {
  throw new Error("ex8: objectOf() is not implemented yet - edit this file.");
}
