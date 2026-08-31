// d16_transform_pipeline / ex1 - reference solution (author only, used by `dojo verify`).
import { Transform } from "node:stream";

export function createMapStage<T, R>(fn: (item: T) => R): Transform {
  return new Transform({
    objectMode: true,
    transform(chunk: T, _encoding, callback) {
      try {
        // The two-argument callback is push-and-continue in one call.
        callback(null, fn(chunk));
      } catch (error) {
        // A throw here would be an uncaught exception on the next tick, not a
        // stream error - the callback is the only way out.
        callback(error as Error);
      }
    },
  });
}
