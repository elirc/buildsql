// d21_async_typing / ex4 - reference solution (author only).

export async function* pages<T>(
  fetchPage: (cursor: string | null) => Promise<{ items: readonly T[]; next: string | null }>,
): AsyncGenerator<T, void, undefined> {
  let cursor: string | null = null;
  for (;;) {
    const page = await fetchPage(cursor);
    for (const item of page.items) {
      yield item;
    }
    if (page.next === null) {
      return;
    }
    cursor = page.next;
  }
}

export async function collect<T>(source: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of source) {
    items.push(item);
  }
  return items;
}
