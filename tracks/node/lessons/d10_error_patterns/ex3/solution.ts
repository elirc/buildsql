// d10_error_patterns / ex3 - never release Zalgo.
// See lessons/d10_error_patterns/README.md, "Problem 3".

/**
 * Wrap a function so it ALWAYS returns a promise and NEVER throws
 * synchronously - including when it validates its arguments and throws before
 * any promise exists. A function that already returns a promise is adopted.
 */
export function ensureAsync<A extends unknown[], R>(
  fn: (...args: A) => R | Promise<R>,
): (...args: A) => Promise<R> {
  throw new Error("ex3: ensureAsync() is not implemented yet - edit this file.");
}
