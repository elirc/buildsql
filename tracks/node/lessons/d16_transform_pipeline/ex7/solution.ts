// d16_transform_pipeline / ex7 - parallel work, sequential output.
// See lessons/d16_transform_pipeline/README.md, "Problem 7".
import { Transform } from "node:stream";

/**
 * An object-mode Transform that keeps at most `limit` calls to `worker` in
 * flight at once and emits their results in INPUT order. A rejection fails the
 * stream.
 */
export function createOrderedParallelStage<T, R>(
  worker: (item: T) => Promise<R>,
  limit: number,
): Transform {
  throw new Error(
    "ex7: createOrderedParallelStage() is not implemented yet - edit this file.",
  );
}
