// d17_backpressure / ex2 - a source that waits to be asked.
// See lessons/d17_backpressure/README.md, "Problem 2".
import { Readable } from "node:stream";

export interface DemandSource extends Readable {
  /** How many items have actually been produced so far. */
  produced(): number;
}

/**
 * An object-mode Readable that hands over `items` one at a time, only as its
 * consumer asks for them, and never runs more than `highWaterMark` ahead.
 */
export function createDemandSource<T>(
  items: readonly T[],
  highWaterMark: number,
): DemandSource {
  throw new Error("ex2: createDemandSource() is not implemented yet - edit this file.");
}
