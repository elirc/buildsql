// d17_backpressure / ex8 - send the work where there is room for it.
// See lessons/d17_backpressure/README.md, "Problem 8".
import type { Readable, Writable } from "node:stream";

/**
 * Route every chunk of `source` to whichever sink is currently holding least,
 * waiting when they are all full rather than buffering. Ends every sink and
 * resolves with the number of chunks each one received.
 */
export async function balanceAcross(
  source: Readable,
  sinks: Writable[],
): Promise<number[]> {
  throw new Error("ex8: balanceAcross() is not implemented yet - edit this file.");
}
