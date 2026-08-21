// 07_streams_2 / ex2 - pipeline(), and why .pipe() is not enough.
// See lessons/07_streams_2/README.md, "Exercise 2".
import type { Readable, Transform, Writable } from "node:stream";

export async function pipeThrough(
  source: Readable,
  transforms: Transform[],
  sink: Writable,
): Promise<void> {
  throw new Error("ex2: pipeThrough() is not implemented yet - edit this file.");
}
