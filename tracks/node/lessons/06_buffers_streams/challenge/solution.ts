// 06_buffers_streams / challenge - backpressure, by hand.
// See lessons/06_buffers_streams/README.md, "Challenge".
import type { Writable } from "node:stream";

export async function writeAll(writable: Writable, chunks: Buffer[]): Promise<void> {
  throw new Error("challenge: writeAll() is not implemented yet - edit this file.");
}
