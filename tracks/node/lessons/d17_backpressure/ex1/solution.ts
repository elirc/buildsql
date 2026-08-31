// d17_backpressure / ex1 - the primitive under every writer.
// See lessons/d17_backpressure/README.md, "Problem 1".
import type { Writable } from "node:stream";

/**
 * Write one chunk and resolve when it is safe to write another: at once if
 * `write()` returned true, on `drain` if it returned false. Rejects if the
 * stream fails while you are waiting, and leaves no listeners behind.
 */
export function writeAndWait(writable: Writable, chunk: unknown): Promise<void> {
  throw new Error("ex1: writeAndWait() is not implemented yet - edit this file.");
}
