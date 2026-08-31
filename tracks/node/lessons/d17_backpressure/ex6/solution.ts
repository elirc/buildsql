// d17_backpressure / ex6 - a writer you can call off.
// See lessons/d17_backpressure/README.md, "Problem 6".
import type { Writable } from "node:stream";

/**
 * Write every chunk in order, honouring backpressure, until `signal` aborts.
 * Then stop: reject with `signal.reason` without waiting for what is already
 * queued. An already-aborted signal writes nothing at all.
 */
export async function writeAllOrAbort(
  writable: Writable,
  chunks: readonly unknown[],
  signal: AbortSignal,
): Promise<void> {
  throw new Error("ex6: writeAllOrAbort() is not implemented yet - edit this file.");
}
