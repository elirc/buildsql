// d05_promise_basics / ex1 - the deferred.
// See lessons/d05_promise_basics/README.md, "Problem 1".

export interface Deferred<T> {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(reason: unknown): void;
  settled(): boolean;
}

/**
 * A promise with its settle buttons handed back to the caller. The first
 * resolve or reject wins; every later one is ignored, not thrown.
 */
export function deferred<T>(): Deferred<T> {
  throw new Error("ex1: deferred() is not implemented yet - edit this file.");
}
