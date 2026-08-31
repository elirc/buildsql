// d11_custom_errors / ex7 - identity when instanceof cannot help.
// See lessons/d11_custom_errors/README.md, "Problem 7".

/**
 * True when `value` behaves like an Error whose `name` matches - including an
 * error-shaped object from another realm, where instanceof would say no.
 * An error has BOTH a string name and a string message.
 */
export function isErrorOfType(value: unknown, name: string): boolean {
  throw new Error("ex7: isErrorOfType() is not implemented yet - edit this file.");
}

/**
 * `x instanceof ErrorLike` is true for anything shaped like an Error, whoever
 * constructed it.
 */
export class ErrorLike {
  static [Symbol.hasInstance](value: unknown): boolean {
    throw new Error("ex7: ErrorLike is not implemented yet - edit this file.");
  }
}
