// d15_readable_writable / ex7 - many sources, one stream, no order lost.
// See lessons/d15_readable_writable/README.md, "Problem 7".
import { Readable } from "node:stream";

/**
 * One object-mode Readable carrying every item from every source as it is
 * produced. It ends when ALL sources have ended; the first error destroys the
 * other sources and propagates.
 */
export function mergeStreams(sources: Readable[]): Readable {
  throw new Error("ex7: mergeStreams() is not implemented yet - edit this file.");
}
