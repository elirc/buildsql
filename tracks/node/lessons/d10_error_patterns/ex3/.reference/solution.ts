// d10_error_patterns / ex3 - reference solution (author only, used by `dojo verify`).

export function ensureAsync<A extends unknown[], R>(
  fn: (...args: A) => R | Promise<R>,
): (...args: A) => Promise<R> {
  // An `async` wrapper is the whole trick: the body runs synchronously up to
  // its first await, but a throw from it becomes a rejection of the promise
  // the wrapper already returned, and a returned promise is adopted.
  return async (...args: A): Promise<R> => fn(...args);
}
