// 11_async_and_modules / ex3 - reference solution (author only).

export async function* pages(items: readonly string[], size: number): AsyncGenerator<string[]> {
  if (size < 1) {
    return;
  }
  for (let i = 0; i < items.length; i += size) {
    yield items.slice(i, i + size);
  }
}

export async function collect<T>(source: AsyncIterable<T>): Promise<T[]> {
  const all: T[] = [];
  for await (const item of source) {
    all.push(item);
  }
  return all;
}
