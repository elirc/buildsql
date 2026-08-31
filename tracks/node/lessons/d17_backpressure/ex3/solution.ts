// d17_backpressure / ex3 - the sink that would rather lose data than block.
// See lessons/d17_backpressure/README.md, "Problem 3".
import { Writable } from "node:stream";

export interface LossySink extends Writable {
  /** The items still held, oldest first. */
  items(): unknown[];
  /** How many were thrown away to make room. */
  dropped(): number;
}

/**
 * A Writable that accepts everything immediately and keeps only the newest
 * `capacity` items, counting the ones it discarded.
 */
export function createLossySink(options: { capacity: number }): LossySink {
  throw new Error("ex3: createLossySink() is not implemented yet - edit this file.");
}
