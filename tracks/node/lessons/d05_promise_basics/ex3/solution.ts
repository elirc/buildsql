// d05_promise_basics / ex3 - recovering, and failing to recover.
// See lessons/d05_promise_basics/README.md, "Problem 3".

/**
 * Fall back when the promise rejects. A fulfilled input passes through and the
 * fallback is never called; a fallback that returns a promise is adopted; a
 * fallback that fails rejects the result with ITS error.
 */
export function orElse<T>(
  promise: Promise<T>,
  fallback: (reason: unknown) => T | Promise<T>,
): Promise<T> {
  throw new Error("ex3: orElse() is not implemented yet - edit this file.");
}
