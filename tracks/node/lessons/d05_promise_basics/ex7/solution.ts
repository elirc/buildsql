// d05_promise_basics / ex7 - adopting a thenable, by the book.
// See lessons/d05_promise_basics/README.md, "Problem 7".

export interface Thenable<T> {
  then(onFulfilled: (value: T) => void, onRejected: (reason: unknown) => void): void;
}

/**
 * What `Promise.resolve` does with its argument:
 *
 * - a non-object, or an object with no callable `then`, is wrapped as a value;
 * - otherwise `then` is READ once, called once, with two settle callbacks;
 * - the first settlement wins;
 * - a throw from reading or calling `then` rejects, unless it already settled.
 */
export function adoptThenable<T>(value: T | Thenable<T>): Promise<T> {
  throw new Error("ex7: adoptThenable() is not implemented yet - edit this file.");
}
