// d15_readable_writable / ex1 - a source you build yourself.
// See lessons/d15_readable_writable/README.md, "Problem 1".
import { Readable } from "node:stream";

/**
 * An object-mode Readable that produces `from`, `from + step`, ... up to and
 * including `to` when the step lands on it. An empty range ends immediately.
 */
export function createRangeStream(from: number, to: number, step: number): Readable {
  throw new Error("ex1: createRangeStream() is not implemented yet - edit this file.");
}
