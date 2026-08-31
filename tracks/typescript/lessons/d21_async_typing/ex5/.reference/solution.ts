// d21_async_typing / ex5 - reference solution (author only).

export async function withRetry<T>(task: () => Promise<T>, attempts: number): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await task();
    } catch (error: unknown) {
      lastError = error;
    }
  }
  throw lastError;
}
