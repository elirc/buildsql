// d05_promise_basics / ex8 - build the thing from the other side.
// See lessons/d05_promise_basics/README.md, "Problem 8".

export interface MinimalThenable<T> {
  then(
    onFulfilled?: ((value: T) => void) | null,
    onRejected?: ((reason: unknown) => void) | null,
  ): void;
}

export interface Settleable<T> {
  thenable: MinimalThenable<T>;
  resolve(value: T): void;
  reject(reason: unknown): void;
}

/**
 * A hand-built promise-like, good enough that `Promise.resolve()` adopts it.
 *
 * - `then` works before or after settling;
 * - handlers ALWAYS run asynchronously, never from inside then() or resolve();
 * - every registered handler runs, in registration order;
 * - the first settlement wins.
 *
 * You may not use `Promise` to hold the state - that would be cheating.
 */
export function createSettleable<T>(): Settleable<T> {
  throw new Error("ex8: createSettleable() is not implemented yet - edit this file.");
}
