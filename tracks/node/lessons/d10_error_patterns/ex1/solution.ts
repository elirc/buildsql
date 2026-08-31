// d10_error_patterns / ex1 - anything can be thrown.
// See lessons/d10_error_patterns/README.md, "Problem 1".

/**
 * Turn whatever was thrown into a real Error.
 *
 * An Error (or subclass) comes back unchanged. A string becomes the message,
 * with nothing kept as a cause. An object with a string `message` donates that
 * message and is kept as the cause. Anything else is stringified for the
 * message and kept as the cause.
 */
export function asError(thrown: unknown): Error {
  throw new Error("ex1: asError() is not implemented yet - edit this file.");
}
