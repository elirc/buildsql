// d05_promise_basics / ex7 - reference solution (author only, used by `dojo verify`).

export interface Thenable<T> {
  then(onFulfilled: (value: T) => void, onRejected: (reason: unknown) => void): void;
}

export function adoptThenable<T>(value: T | Thenable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (value === null || (typeof value !== "object" && typeof value !== "function")) {
      resolve(value as T);
      return;
    }

    let settled = false;
    try {
      // ONE read. `.then` may be a getter, and a getter is allowed to return a
      // different function every time it is asked - or to throw.
      const then = (value as Thenable<T>).then;
      if (typeof then !== "function") {
        resolve(value as T);
        return;
      }
      then.call(
        value,
        (result: T) => {
          if (settled) return;
          settled = true;
          resolve(result);
        },
        (reason: unknown) => {
          if (settled) return;
          settled = true;
          reject(reason);
        },
      );
    } catch (error) {
      // A throw after the thenable already settled is not our business.
      if (!settled) reject(error);
    }
  });
}
