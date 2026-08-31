// d08_promise_combinators / ex3 - reference solution (author only, used by `dojo verify`).

export function anyOf<T>(promises: readonly Promise<T>[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const errors = new Array<unknown>(promises.length);
    let outstanding = promises.length;

    if (outstanding === 0) {
      reject(new AggregateError([], "all promises were rejected"));
      return;
    }

    promises.forEach((promise, index) => {
      promise.then(resolve, (reason: unknown) => {
        // By index, so the reasons stay in input order however they arrived.
        errors[index] = reason;
        outstanding -= 1;
        if (outstanding === 0) {
          reject(new AggregateError(errors, "all promises were rejected"));
        }
      });
    });
  });
}
