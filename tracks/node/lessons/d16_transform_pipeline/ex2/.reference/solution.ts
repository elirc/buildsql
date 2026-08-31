// d16_transform_pipeline / ex2 - reference solution (author only, used by `dojo verify`).
import { Transform } from "node:stream";

export interface FilterStage extends Transform {
  kept(): number;
  dropped(): number;
}

export function createFilterStage<T>(predicate: (item: T) => boolean): FilterStage {
  let kept = 0;
  let dropped = 0;

  const stage = new Transform({
    objectMode: true,
    transform(chunk: T, _encoding, callback) {
      if (predicate(chunk)) {
        kept += 1;
        this.push(chunk);
      } else {
        dropped += 1;
      }
      // Called on BOTH paths: the callback means "done with this chunk", not
      // "here is an output". Forgetting it on the dropped path stalls forever.
      callback();
    },
  }) as FilterStage;

  stage.kept = () => kept;
  stage.dropped = () => dropped;
  return stage;
}
