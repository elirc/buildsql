// d16_transform_pipeline / ex4 - flatMap, as a stage.
// See lessons/d16_transform_pipeline/README.md, "Problem 4".
import { Transform } from "node:stream";

/**
 * An object-mode Transform that pushes every element `fn(item)` produces. `fn`
 * may return an array or an async iterable; an empty one drops the item.
 */
export function createExpandStage<T, R>(
  fn: (item: T) => R[] | AsyncIterable<R>,
): Transform {
  throw new Error("ex4: createExpandStage() is not implemented yet - edit this file.");
}
