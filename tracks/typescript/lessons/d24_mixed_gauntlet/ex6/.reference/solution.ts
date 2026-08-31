// d24_mixed_gauntlet / ex6 - reference solution (author only).

export async function firstSuccess<T>(tasks: readonly (() => Promise<T>)[]): Promise<T> {
  if (tasks.length === 0) {
    throw new Error("firstSuccess: no tasks were given");
  }
  let lastError: unknown;
  for (const task of tasks) {
    try {
      return await task();
    } catch (error: unknown) {
      lastError = error;
    }
  }
  throw lastError;
}
