// 11_async_and_modules / ex3 - async iteration.
// See lessons/11_async_and_modules/README.md, "Exercise 3".

export async function* pages(items: readonly string[], size: number): AsyncGenerator<string[]> {
  throw new Error("ex3: pages() is not implemented yet - edit this file.");
}

export function collect(source: AsyncIterable<unknown>): Promise<unknown[]> {
  throw new Error("ex3: collect() is not implemented yet - edit this file.");
}
