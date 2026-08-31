// d16_transform_pipeline / ex3 - reference solution (author only, used by `dojo verify`).
import { Transform } from "node:stream";

export function createBatchStage<T>(size: number): Transform {
  let batch: T[] = [];

  return new Transform({
    objectMode: true,
    transform(chunk: T, _encoding, callback) {
      batch.push(chunk);
      if (batch.length === size) {
        this.push(batch);
        // A fresh array, not batch.length = 0: the one just pushed is now
        // owned by whatever is downstream and must not be mutated.
        batch = [];
      }
      callback();
    },
    flush(callback) {
      // The remainder. The guard is what stops an exact multiple emitting [].
      if (batch.length > 0) this.push(batch);
      callback();
    },
  });
}
