// d06_narrowing_guards / ex4 - an assertion function.
// See lessons/d06_narrowing_guards/README.md, "ex4".
//
// `void` throws and narrows nothing. `asserts value is T` throws and narrows
// everything after the call.

export function assertIsRecord(value: unknown): void {
  throw new Error("ex4: assertIsRecord() is not implemented yet - edit this file.");
}
