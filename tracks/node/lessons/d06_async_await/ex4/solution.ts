// d06_async_await / ex4 - cleanup that does not lie about what went wrong.
// See lessons/d06_async_await/README.md, "Problem 4".

/**
 * Run `run`, then `cleanup`, whatever happened - and await the cleanup before
 * the caller resumes.
 *
 * If only the cleanup fails, its error is the result. If both fail, the
 * ORIGINAL error is the result.
 */
export async function withCleanup<T>(
  run: () => Promise<T>,
  cleanup: () => Promise<void> | void,
): Promise<T> {
  throw new Error("ex4: withCleanup() is not implemented yet - edit this file.");
}
