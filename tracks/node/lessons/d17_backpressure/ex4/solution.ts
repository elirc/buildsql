// d17_backpressure / ex4 - async work in the middle of a stream.
// See lessons/d17_backpressure/README.md, "Problem 4".
import { Transform } from "node:stream";

/**
 * An object-mode Transform that awaits `fn` for each item. The source must not
 * be allowed to race ahead of the work: only one call to `fn` is outstanding,
 * and no more than `highWaterMark` items may queue up in front of it.
 */
export function createAsyncStage<T, R>(
  fn: (item: T) => Promise<R>,
  options: { highWaterMark?: number } = {},
): Transform {
  throw new Error("ex4: createAsyncStage() is not implemented yet - edit this file.");
}
