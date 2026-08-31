// d11_custom_errors / ex7 - reference solution (author only, used by `dojo verify`).

/** Two string fields is the smallest honest definition of "error shaped". */
function looksLikeError(value: unknown): value is { name: string; message: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { name?: unknown }).name === "string" &&
    typeof (value as { message?: unknown }).message === "string"
  );
}

export function isErrorOfType(value: unknown, name: string): boolean {
  return looksLikeError(value) && value.name === name;
}

export class ErrorLike {
  // instanceof consults this when the right-hand side defines it, so a class
  // can decide for itself what membership means.
  static [Symbol.hasInstance](value: unknown): boolean {
    return looksLikeError(value);
  }
}
