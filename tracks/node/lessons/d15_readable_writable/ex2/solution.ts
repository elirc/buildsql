// d15_readable_writable / ex2 - the whole stream, or the real error.
// See lessons/d15_readable_writable/README.md, "Problem 2".
import { Readable } from "node:stream";

/**
 * Every item of an object-mode Readable, in order. A stream that errors rejects
 * with that error - never resolves with a partial array.
 */
export async function toArray<T>(readable: Readable): Promise<T[]> {
  throw new Error("ex2: toArray() is not implemented yet - edit this file.");
}
