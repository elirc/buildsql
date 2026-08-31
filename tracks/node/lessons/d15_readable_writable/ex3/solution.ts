// d15_readable_writable / ex3 - a sink with a budget.
// See lessons/d15_readable_writable/README.md, "Problem 3".
import { Writable } from "node:stream";

export interface BoundedSink {
  /** The sink itself: pipe into this. */
  writable: Writable;
  /** How many bytes have been accepted so far. */
  bytes(): number;
}

/**
 * A Writable that accepts chunks until one would take the total past `limit`
 * bytes, then fails that write with an error naming the limit.
 */
export function createBoundedSink(limit: number): BoundedSink {
  throw new Error("ex3: createBoundedSink() is not implemented yet - edit this file.");
}
