// d08_promise_combinators / ex4 - reference solution (author only, used by `dojo verify`).

export function allWithProgress<T>(
  promises: readonly Promise<T>[],
  onProgress: (done: number, total: number) => void,
): Promise<T[]> {
  const total = promises.length;

  return new Promise<T[]>((resolve, reject) => {
    const results = new Array<T>(total);
    let done = 0;

    if (total === 0) {
      resolve([]);
      return;
    }

    promises.forEach((promise, index) => {
      promise.then((value) => {
        // Two different orders live side by side here: the write is by INDEX
        // (input order) and the report is by arrival (completion order).
        results[index] = value;
        done += 1;
        onProgress(done, total);
        if (done === total) resolve(results);
      }, reject);
    });
  });
}
