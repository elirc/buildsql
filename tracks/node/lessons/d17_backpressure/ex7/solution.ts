// d17_backpressure / ex7 - spend the waiting time collecting.
// See lessons/d17_backpressure/README.md, "Problem 7".
import type { Writable } from "node:stream";

export interface BatchingWriter<T> {
  /** Accept an item. Never blocks; never rejects. */
  write(item: T): void;
  /** Flush what is left, end the sink, and resolve when it has all landed. */
  end(): Promise<void>;
}

/**
 * Wrap `sink` so that items arriving while it is busy are collected and sent
 * as one array write when it comes free - never more than `maxBatch` at a time.
 */
export function createBatchingWriter<T>(
  sink: Writable,
  options: { maxBatch: number },
): BatchingWriter<T> {
  throw new Error("ex7: createBatchingWriter() is not implemented yet - edit this file.");
}
