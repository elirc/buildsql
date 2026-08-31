// d16_transform_pipeline / ex3 - the group is the unit.
// See lessons/d16_transform_pipeline/README.md, "Problem 3".
import { Transform } from "node:stream";

/**
 * An object-mode Transform that emits arrays of `size` items. The final batch
 * is emitted when the input ends, however short it is - and an empty input
 * emits nothing at all.
 */
export function createBatchStage<T>(size: number): Transform {
  throw new Error("ex3: createBatchStage() is not implemented yet - edit this file.");
}
