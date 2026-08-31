// d16_transform_pipeline / ex1 - map, as a stage.
// See lessons/d16_transform_pipeline/README.md, "Problem 1".
import { Transform } from "node:stream";

/**
 * An object-mode Transform that pushes `fn(item)` for every item. A throw
 * inside `fn` fails the stream; it never escapes as an uncaught exception.
 */
export function createMapStage<T, R>(fn: (item: T) => R): Transform {
  throw new Error("ex1: createMapStage() is not implemented yet - edit this file.");
}
