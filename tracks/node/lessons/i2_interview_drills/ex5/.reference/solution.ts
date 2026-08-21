// i2_interview_drills / ex5 - reference solution (author only, used by `dojo verify`).

export type Callback<T> = (error: Error | null, value?: T) => void;

export function promisify<A, T>(
  fn: (arg: A, callback: Callback<T>) => void,
): (arg: A) => Promise<T> {
  return (arg: A) =>
    new Promise<T>((resolve, reject) => {
      fn(arg, (error, value) => {
        if (error) reject(error);
        else resolve(value as T);
      });
    });
}

export function callbackify<A, T>(
  fn: (arg: A) => Promise<T>,
): (arg: A, callback: Callback<T>) => void {
  return (arg: A, callback: Callback<T>): void => {
    // then() always calls back asynchronously, even for an already-settled
    // promise, which is exactly the guarantee the convention needs.
    fn(arg).then(
      (value) => callback(null, value),
      (error: unknown) => callback(error instanceof Error ? error : new Error(String(error))),
    );
  };
}
