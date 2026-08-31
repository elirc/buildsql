// d06_async_await / ex3 - reference solution (author only, used by `dojo verify`).

export type Attempt<T> = [error: null, value: T] | [error: Error, value: null];

export async function attempt<T>(fn: () => Promise<T> | T): Promise<Attempt<T>> {
  try {
    // The CALL is inside the try, not just the await. A function that throws
    // while validating its arguments never gets as far as returning a promise.
    const value = await fn();
    return [null, value];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
}
