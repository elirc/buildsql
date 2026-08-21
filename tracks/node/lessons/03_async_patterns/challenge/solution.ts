// 03_async_patterns / challenge - retry, with a backoff that means it.
// See lessons/03_async_patterns/README.md, "Challenge".

export interface RetryOptions {
  /** Total attempts, including the first one. */
  attempts: number;
  /** The wait before the first retry; doubled before each further retry. */
  baseDelayMs: number;
  /** Defaults to "retry anything". */
  isRetryable?: (error: unknown) => boolean;
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  throw new Error("challenge: retryWithBackoff() is not implemented yet - edit this file.");
}
