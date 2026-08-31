// d08_promise_combinators / ex5 - allSettled, with a deadline.
// See lessons/d08_promise_combinators/README.md, "Problem 5".

export type Outcome<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown }
  | { status: "timedout" };

/**
 * Wait at most `ms`. Everything settled by then reports its outcome; the rest
 * report `{ status: "timedout" }`. One record per input, in input order, and
 * the call never rejects. If everything settles early it resolves early - and
 * either way it leaves no timer armed.
 */
export function settleWithin<T>(
  promises: readonly Promise<T>[],
  ms: number,
): Promise<Outcome<T>[]> {
  throw new Error("ex5: settleWithin() is not implemented yet - edit this file.");
}
