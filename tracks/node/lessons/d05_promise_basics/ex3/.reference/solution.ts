// d05_promise_basics / ex3 - reference solution (author only, used by `dojo verify`).

export function orElse<T>(
  promise: Promise<T>,
  fallback: (reason: unknown) => T | Promise<T>,
): Promise<T> {
  // .catch(fn) is .then(undefined, fn): a rejection handler that RETURNS turns
  // the rejection into a fulfilment, and one that throws produces a new
  // rejection. Both requirements are already in the method.
  return promise.catch(fallback);
}
