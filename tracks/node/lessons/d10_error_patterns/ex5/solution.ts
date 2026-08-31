// d10_error_patterns / ex5 - say what you were doing.
// See lessons/d10_error_patterns/README.md, "Problem 5".

/**
 * Wrap an async function so every rejection is replaced by a NEW error reading
 * `<context>: <original message>`, with the original kept as `cause`. Anything
 * thrown is normalised first. A success passes through by identity, and the
 * original error is never mutated.
 */
export function withContext<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  context: string,
): (...args: A) => Promise<R> {
  throw new Error("ex5: withContext() is not implemented yet - edit this file.");
}
