// d19_unknown_any_never / ex8 - a function that never returns.
// See lessons/d19_unknown_any_never/README.md, "ex8".
//
// The stub declares fail() as returning void, so the compiler
// keeps believing that execution continues after it.

export function fail(message: string): void {
  throw new Error(message);
}

export function requirePort(raw: unknown): number {
  throw new Error("ex8: requirePort() is not implemented yet - edit this file.");
}
