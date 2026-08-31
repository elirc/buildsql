// d20_satisfies_asconst / ex6 - as const on the callee side.
// See lessons/d20_satisfies_asconst/README.md, "ex6".
//
// The stub has an ordinary type parameter, so the argument
// widens on the way in and the literals are gone before the body runs.

export function tupleOf<T extends readonly unknown[]>(values: T): T {
  throw new Error("ex6: tupleOf() is not implemented yet - edit this file.");
}
