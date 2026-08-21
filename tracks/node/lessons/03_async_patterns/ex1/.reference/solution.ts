// 03_async_patterns / ex1 - reference solution (author only, used by `dojo verify`).

export type Callback<T> = (error: Error | null, value?: T) => void;

export function promisifyOne<A, T>(
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
