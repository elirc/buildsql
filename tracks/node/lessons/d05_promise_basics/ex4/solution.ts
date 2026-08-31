// d05_promise_basics / ex4 - observing without interfering.
// See lessons/d05_promise_basics/README.md, "Problem 4".

export type SettleState = "fulfilled" | "rejected";

/**
 * Call `onSettle` on both paths, then pass the original outcome through
 * unchanged - the same value by identity, or the same rejection. If `onSettle`
 * itself throws, that error replaces the outcome.
 */
export function tap<T>(
  promise: Promise<T>,
  onSettle: (state: SettleState, valueOrReason: unknown) => void,
): Promise<T> {
  throw new Error("ex4: tap() is not implemented yet - edit this file.");
}
