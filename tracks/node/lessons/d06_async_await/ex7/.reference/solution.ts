// d06_async_await / ex7 - reference solution (author only, used by `dojo verify`).

export async function* chunked<T>(
  source: AsyncIterable<T>,
  size: number,
): AsyncGenerator<T[], void, undefined> {
  let chunk: T[] = [];

  for await (const item of source) {
    chunk.push(item);
    if (chunk.length === size) {
      yield chunk;
      // A fresh array, not chunk.length = 0: the consumer is holding the one
      // just yielded and would watch it empty itself.
      chunk = [];
    }
  }

  // Whatever is left over, unless there is nothing - an empty trailing chunk
  // is not a chunk.
  if (chunk.length > 0) yield chunk;
}
