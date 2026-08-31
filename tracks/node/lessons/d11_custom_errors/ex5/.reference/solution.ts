// d11_custom_errors / ex5 - reference solution (author only, used by `dojo verify`).

export class RetryableError extends Error {
  readonly code: string;

  constructor(message: string, code: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "RetryableError";
    this.code = code;
  }

  static is(value: unknown): value is RetryableError {
    return value instanceof RetryableError;
  }

  static wrap(thrown: unknown, code: string): RetryableError {
    // Idempotent: without this a retry loop adds a link to the cause chain on
    // every attempt, and after five retries the message is five levels deep.
    if (RetryableError.is(thrown)) return thrown;

    const message = thrown instanceof Error ? thrown.message : String(thrown);
    return new RetryableError(message, code, { cause: thrown });
  }
}
