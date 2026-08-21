// 03_async_patterns / ex1 - from callbacks to promises.
// See lessons/03_async_patterns/README.md, "Exercise 1".

/** The error-first callback convention: error or null, then the value. */
export type Callback<T> = (error: Error | null, value?: T) => void;

export function promisifyOne<A, T>(
  fn: (arg: A, callback: Callback<T>) => void,
): (arg: A) => Promise<T> {
  throw new Error("ex1: promisifyOne() is not implemented yet - edit this file.");
}
