// d06_async_await / ex7 - an async generator.
// See lessons/d06_async_await/README.md, "Problem 7".

/**
 * Re-shape a stream of items into arrays of `size`. The last chunk may be
 * short; an empty source yields nothing at all. A consumer that stops early
 * must end up closing the source.
 */
export async function* chunked<T>(
  source: AsyncIterable<T>,
  size: number,
): AsyncGenerator<T[], void, undefined> {
  throw new Error("ex7: chunked() is not implemented yet - edit this file.");
}
