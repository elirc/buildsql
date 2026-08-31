// d11_custom_errors / ex5 - a class that carries its own guard.
// See lessons/d11_custom_errors/README.md, "Problem 5".

export class RetryableError extends Error {
  readonly code!: string;

  constructor(message: string, code: string, options?: { cause?: unknown }) {
    super(message, options);
    throw new Error("ex5: RetryableError is not implemented yet - edit this file.");
  }

  /** A type guard, so a retry loop can ask before trying again. */
  static is(value: unknown): value is RetryableError {
    throw new Error("ex5: RetryableError.is() is not implemented yet - edit this file.");
  }

  /**
   * Wrap anything as retryable, keeping its message and putting it in `cause`.
   * Something already retryable is returned unchanged.
   */
  static wrap(thrown: unknown, code: string): RetryableError {
    throw new Error("ex5: RetryableError.wrap() is not implemented yet - edit this file.");
  }
}
