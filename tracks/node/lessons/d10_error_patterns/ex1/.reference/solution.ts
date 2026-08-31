// d10_error_patterns / ex1 - reference solution (author only, used by `dojo verify`).

export function asError(thrown: unknown): Error {
  // instanceof covers every subclass too, and returning the same object keeps
  // the original stack trace rather than one taken here.
  if (thrown instanceof Error) return thrown;

  if (typeof thrown === "string") return new Error(thrown);

  if (
    typeof thrown === "object" &&
    thrown !== null &&
    typeof (thrown as { message?: unknown }).message === "string"
  ) {
    // The shape a JSON error response or a cross-realm error arrives in.
    return new Error((thrown as { message: string }).message, { cause: thrown });
  }

  return new Error(String(thrown), { cause: thrown });
}
