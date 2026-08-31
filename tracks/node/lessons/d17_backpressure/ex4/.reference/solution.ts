// d17_backpressure / ex4 - reference solution (author only, used by `dojo verify`).
import { Transform } from "node:stream";

export function createAsyncStage<T, R>(
  fn: (item: T) => Promise<R>,
  options: { highWaterMark?: number } = {},
): Transform {
  return new Transform({
    objectMode: true,
    highWaterMark: options.highWaterMark ?? 1,
    transform(chunk: T, _encoding, callback) {
      // The callback is deliberately NOT called until fn has settled. That is
      // the entire backpressure story: an outstanding callback is the stream's
      // measure of how much work is in progress.
      fn(chunk).then(
        (value) => callback(null, value),
        (error: unknown) => callback(error as Error),
      );
    },
  });
}
