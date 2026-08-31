// d05_promise_basics / ex1 - reference solution (author only, used by `dojo verify`).

export interface Deferred<T> {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(reason: unknown): void;
  settled(): boolean;
}

export function deferred<T>(): Deferred<T> {
  // The executor runs synchronously, which is the only reason capturing the
  // two functions out of it works at all.
  let settleValue!: (value: T) => void;
  let settleReason!: (reason: unknown) => void;
  const promise = new Promise<T>((resolve, reject) => {
    settleValue = resolve;
    settleReason = reject;
  });

  let done = false;

  return {
    promise,
    resolve(value: T): void {
      if (done) return;
      done = true;
      settleValue(value);
    },
    reject(reason: unknown): void {
      if (done) return;
      done = true;
      settleReason(reason);
    },
    settled(): boolean {
      return done;
    },
  };
}
