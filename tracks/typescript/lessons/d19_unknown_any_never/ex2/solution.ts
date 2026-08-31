// d19_unknown_any_never / ex2 - unknown in, number or null out.
// See lessons/d19_unknown_any_never/README.md, "ex2".
//
// The stub promises unknown, which pushes the narrowing back
// onto every caller - the opposite of what this function is for.

export function toNumber(value: unknown): unknown {
  throw new Error("ex2: toNumber() is not implemented yet - edit this file.");
}
