// d15_readable_writable / ex4 - reference solution (author only, used by `dojo verify`).
import { Readable } from "node:stream";

export async function takeFrom<T>(readable: Readable, n: number): Promise<T[]> {
  const items: T[] = [];
  if (n <= 0) {
    readable.destroy();
    return items;
  }
  for await (const item of readable) {
    items.push(item as T);
    // Breaking out of a for-await calls the iterator's return(), which
    // destroys the underlying stream - that is the shutdown the gate checks.
    if (items.length >= n) break;
  }
  return items;
}
