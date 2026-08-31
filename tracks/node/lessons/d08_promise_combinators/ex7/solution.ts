// d08_promise_combinators / ex7 - results as they land.
// See lessons/d08_promise_combinators/README.md, "Problem 7".

export type Settled<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

export interface Landed<T> {
  /** which input this came from */
  index: number;
  result: Settled<T>;
}

/**
 * Yield one entry per input, in COMPLETION order, each tagged with its index.
 * Never throws: a rejection is an entry. An empty input yields nothing.
 */
export async function* settledStream<T>(
  promises: readonly Promise<T>[],
): AsyncGenerator<Landed<T>, void, undefined> {
  throw new Error("ex7: settledStream() is not implemented yet - edit this file.");
}
