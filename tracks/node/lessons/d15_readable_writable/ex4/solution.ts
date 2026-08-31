// d15_readable_writable / ex4 - take what you need, stop the rest.
// See lessons/d15_readable_writable/README.md, "Problem 4".
import { Readable } from "node:stream";

/**
 * The first `n` items of `readable`, after which the source is destroyed so it
 * stops producing. A stream shorter than `n` yields what it has.
 */
export async function takeFrom<T>(readable: Readable, n: number): Promise<T[]> {
  throw new Error("ex4: takeFrom() is not implemented yet - edit this file.");
}
