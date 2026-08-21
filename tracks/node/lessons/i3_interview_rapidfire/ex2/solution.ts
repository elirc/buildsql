// i3_interview_rapidfire / ex2 - backpressure, one more time.
// See lessons/i3_interview_rapidfire/README.md, "Exercise 2".
import type { Writable } from "node:stream";

/** Writes every chunk to dest, honouring backpressure. Returns the count. */
export async function pumpAll(
  source: AsyncIterable<string | Buffer>,
  dest: Writable,
): Promise<number> {
  throw new Error("ex2: pumpAll() is not implemented yet - edit this file.");
}
