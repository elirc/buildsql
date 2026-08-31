// d08_promise_combinators / ex6 - reference solution (author only, used by `dojo verify`).

export function firstMatching<T>(
  promises: readonly Promise<T>[],
  predicate: (value: T) => boolean,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let outstanding = promises.length;

    const giveUp = (): void => {
      outstanding -= 1;
      // Only when every input has had its say: a value that failed the
      // predicate is not a reason to stop, it is a reason to keep waiting.
      if (outstanding === 0) reject(new Error("no result matched"));
    };

    if (outstanding === 0) {
      reject(new Error("no result matched"));
      return;
    }

    for (const promise of promises) {
      promise.then((value) => {
        if (predicate(value)) resolve(value);
        else giveUp();
      }, giveUp);
    }
  });
}
