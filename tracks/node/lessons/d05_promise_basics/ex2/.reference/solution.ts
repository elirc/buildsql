// d05_promise_basics / ex2 - reference solution (author only, used by `dojo verify`).

export function mapPromise<T, R>(
  promise: Promise<T>,
  fn: (value: T) => R | Promise<R>,
): Promise<R> {
  // Every requirement in the doc comment is something .then already does:
  // it returns a NEW promise, it catches a throw in the handler and turns it
  // into a rejection, it adopts a returned promise, and it leaves a rejected
  // input alone when there is no rejection handler.
  return promise.then(fn);
}
