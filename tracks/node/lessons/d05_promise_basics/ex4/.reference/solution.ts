// d05_promise_basics / ex4 - reference solution (author only, used by `dojo verify`).

export type SettleState = "fulfilled" | "rejected";

export function tap<T>(
  promise: Promise<T>,
  onSettle: (state: SettleState, valueOrReason: unknown) => void,
): Promise<T> {
  return promise.then(
    (value) => {
      // No try/catch: a throw here should reject the result, which is exactly
      // what an uncaught throw in a .then handler already does.
      onSettle("fulfilled", value);
      return value;
    },
    (reason: unknown) => {
      onSettle("rejected", reason);
      // Rethrow, or the rejection quietly becomes a fulfilment of undefined.
      throw reason;
    },
  );
}
