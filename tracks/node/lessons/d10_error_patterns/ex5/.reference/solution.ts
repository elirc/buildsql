// d10_error_patterns / ex5 - reference solution (author only, used by `dojo verify`).

function messageOf(thrown: unknown): string {
  return thrown instanceof Error ? thrown.message : String(thrown);
}

export function withContext<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  context: string,
): (...args: A) => Promise<R> {
  return async (...args: A): Promise<R> => {
    try {
      // `return await`, not `return`: without the await the rejection is not
      // in flight inside this function and the catch never sees it.
      return await fn(...args);
    } catch (error) {
      // A new error every time. Editing the message of the one you caught
      // changes it for everybody else who is holding it.
      throw new Error(`${context}: ${messageOf(error)}`, { cause: error });
    }
  };
}
