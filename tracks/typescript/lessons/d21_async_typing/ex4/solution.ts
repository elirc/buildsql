// d21_async_typing / ex4 - walk the pages.
// See lessons/d21_async_typing/README.md, "ex4".
//
// Both stubs are loosely typed and throw, so the walk never
// starts and the item type never arrives.

export async function* pages<T>(
  fetchPage: (cursor: string | null) => Promise<{ items: readonly T[]; next: string | null }>,
): AsyncGenerator<unknown, void, undefined> {
  throw new Error("ex4: pages() is not implemented yet - edit this file.");
}

export async function collect<T>(source: AsyncIterable<T>): Promise<unknown[]> {
  throw new Error("ex4: collect() is not implemented yet - edit this file.");
}
