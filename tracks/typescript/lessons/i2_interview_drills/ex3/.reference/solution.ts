// i2_interview_drills / ex3 - reference solution (author only).

export type Callback<T> = (error: Error | null, value?: T) => void;

export type Promisified<F> = F extends (callback: Callback<infer T>) => void
  ? () => Promise<T>
  : never;

export function promisify<T>(fn: (callback: Callback<T>) => void): () => Promise<T> {
  return () =>
    new Promise<T>((resolve, reject) => {
      fn((error, value) => {
        if (error !== null) {
          reject(error);
        } else {
          resolve(value as T);
        }
      });
    });
}
