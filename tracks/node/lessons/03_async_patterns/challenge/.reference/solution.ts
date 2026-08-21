// 03_async_patterns / challenge - reference solution (author only, used by `dojo verify`).

export interface RetryOptions {
  attempts: number;
  baseDelayMs: number;
  isRetryable?: (error: unknown) => boolean;
}

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const { attempts, baseDelayMs, isRetryable = () => true } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === attempts) break;
      await wait(baseDelayMs * 2 ** (attempt - 1));
    }
  }
  throw lastError;
}
