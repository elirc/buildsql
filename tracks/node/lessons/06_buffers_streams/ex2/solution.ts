// 06_buffers_streams / ex2 - collecting a stream, without corrupting it.
// See lessons/06_buffers_streams/README.md, "Exercise 2".
import type { Readable } from "node:stream";

export async function collect(source: Readable): Promise<Buffer> {
  throw new Error("ex2: collect() is not implemented yet - edit this file.");
}
