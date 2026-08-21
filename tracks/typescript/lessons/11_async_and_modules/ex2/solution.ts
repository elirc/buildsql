// 11_async_and_modules / ex2 - two promises, in flight at the same time.
// See lessons/11_async_and_modules/README.md, "Exercise 2".
//
// The types here throw away what each task produces, and the gate also checks
// that the two tasks actually overlap.

export function bothOf(a: () => Promise<unknown>, b: () => Promise<unknown>): Promise<unknown[]> {
  throw new Error("ex2: bothOf() is not implemented yet - edit this file.");
}
