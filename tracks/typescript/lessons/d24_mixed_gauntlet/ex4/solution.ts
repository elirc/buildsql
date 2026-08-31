// d24_mixed_gauntlet / ex4 - split a literal, at both levels.
// See lessons/d24_mixed_gauntlet/README.md, "ex4".
//
// The stub widens both halves to string, so the call site learns
// the shape and nothing about the contents.

export type EventOf<S extends string> = { scope: string; name: string };

export function splitEvent<S extends string>(event: S): EventOf<S> {
  throw new Error("ex4: splitEvent() is not implemented yet - edit this file.");
}
