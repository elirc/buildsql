// d16_transform_pipeline / ex4 - reference solution (author only, used by `dojo verify`).
import { Transform } from "node:stream";

export function createExpandStage<T, R>(
  fn: (item: T) => R[] | AsyncIterable<R>,
): Transform {
  return new Transform({
    objectMode: true,
    async transform(chunk: T, _encoding, callback) {
      try {
        const produced = fn(chunk);
        if (Array.isArray(produced)) {
          for (const item of produced) this.push(item);
        } else {
          // Drained fully before the callback, so the next input cannot start
          // interleaving its own output with this one.
          for await (const item of produced) this.push(item);
        }
        callback();
      } catch (error) {
        callback(error as Error);
      }
    },
  });
}
