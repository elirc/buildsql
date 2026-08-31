// d11_custom_errors / ex4 - the other side of the wire.
// See lessons/d11_custom_errors/README.md, "Problem 4".

/** The same shape problem 3 produces, restated here so this problem stands alone. */
export interface SerialisedError {
  name: string;
  message: string;
  code?: string;
  status?: number;
  cause?: SerialisedError;
}

export type ErrorClass = new (message: string) => Error;

/**
 * Rebuild an error from its serialised form. A name the registry knows becomes
 * an instance of that class; anything else becomes a plain Error that keeps the
 * original name anyway. `code` and `status` are put back, and `cause` is
 * revived recursively.
 */
export function reviveError(
  json: SerialisedError,
  registry: Record<string, ErrorClass>,
): Error {
  throw new Error("ex4: reviveError() is not implemented yet - edit this file.");
}
