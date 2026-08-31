// d06_async_await / ex3 - failure as a value.
// See lessons/d06_async_await/README.md, "Problem 3".

export type Attempt<T> = [error: null, value: T] | [error: Error, value: null];

/**
 * Run `fn` and report the outcome as a tuple instead of a throw.
 *
 * `fn` may throw synchronously, before it ever returns a promise, and anything
 * at all may be thrown - the first slot is always null or a real Error.
 */
export async function attempt<T>(fn: () => Promise<T> | T): Promise<Attempt<T>> {
  throw new Error("ex3: attempt() is not implemented yet - edit this file.");
}
