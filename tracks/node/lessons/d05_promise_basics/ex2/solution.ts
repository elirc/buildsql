// d05_promise_basics / ex2 - what .then actually does.
// See lessons/d05_promise_basics/README.md, "Problem 2".
//
// Write this one with .then, not with async/await. The point is to see the
// machinery you normally hide.

/**
 * Transform the fulfilled value. A mapper that throws rejects the result; a
 * mapper that returns a promise is flattened; a rejected input never reaches
 * the mapper at all.
 */
export function mapPromise<T, R>(
  promise: Promise<T>,
  fn: (value: T) => R | Promise<R>,
): Promise<R> {
  throw new Error("ex2: mapPromise() is not implemented yet - edit this file.");
}
