// d16_transform_pipeline / ex2 - filter, as a stage, with a receipt.
// See lessons/d16_transform_pipeline/README.md, "Problem 2".
import { Transform } from "node:stream";

export interface FilterStage extends Transform {
  /** How many items the predicate kept. */
  kept(): number;
  /** How many it threw away. */
  dropped(): number;
}

/**
 * An object-mode Transform that passes on the items `predicate` likes and
 * silently drops the rest, counting both.
 */
export function createFilterStage<T>(predicate: (item: T) => boolean): FilterStage {
  throw new Error("ex2: createFilterStage() is not implemented yet - edit this file.");
}
