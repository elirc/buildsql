// d05_promise_basics / ex5 - a snapshot of a state you cannot ask for.
// See lessons/d05_promise_basics/README.md, "Problem 5".

export type Snapshot<T> =
  | { state: "pending" }
  | { state: "fulfilled"; value: T }
  | { state: "rejected"; reason: unknown };

/**
 * Report what `promise` looks like right now, without waiting for it and
 * without changing it. A promise that has not settled reports "pending".
 */
export function inspect<T>(promise: Promise<T>): Promise<Snapshot<T>> {
  throw new Error("ex5: inspect() is not implemented yet - edit this file.");
}
