// d08_promise_combinators / ex1 - reference solution (author only, used by `dojo verify`).

export function allInOrder<T>(promises: readonly Promise<T>[]): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    // Pre-sized and written by index: that is what keeps input order without
    // any sorting, and why nothing here cares who finished first.
    const results = new Array<T>(promises.length);
    let remaining = promises.length;

    if (remaining === 0) {
      resolve([]);
      return;
    }

    promises.forEach((promise, index) => {
      promise.then((value) => {
        results[index] = value;
        remaining -= 1;
        if (remaining === 0) resolve(results);
      }, reject); // the first rejection settles the whole thing; later ones are no-ops
    });
  });
}
