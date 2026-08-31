// d15_readable_writable / ex2 - reference solution (author only, used by `dojo verify`).
import { Readable } from "node:stream";

export async function toArray<T>(readable: Readable): Promise<T[]> {
  const items: T[] = [];
  // for-await subscribes, unsubscribes, and turns an error event into a
  // rejection - the three things the hand-rolled data/end/error version has to
  // remember to do itself.
  for await (const item of readable) {
    items.push(item as T);
  }
  return items;
}
