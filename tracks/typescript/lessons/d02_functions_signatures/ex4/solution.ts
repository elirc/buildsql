// d02_functions_signatures / ex4 - a named function type and a default.
// See lessons/d02_functions_signatures/README.md, "ex4".
//
// `unknown` as the result type accepts every function ever written, which is
// the opposite of what a named type is for.

export type Formatter = (value: number) => unknown;

export function formatAll(values: readonly number[], format?: Formatter): string[] {
  throw new Error("ex4: formatAll() is not implemented yet - edit this file.");
}
