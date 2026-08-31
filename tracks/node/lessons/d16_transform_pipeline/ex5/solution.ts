// d16_transform_pipeline / ex5 - a stage that is just a function.
// See lessons/d16_transform_pipeline/README.md, "Problem 5".

/** What `pipeline()` accepts as a middle stage: iterable in, iterable out. */
export type AsyncStage<T, R> = (source: AsyncIterable<T>) => AsyncGenerator<R>;

/**
 * A pipeline stage that awaits `fn` for each item, one at a time, and yields
 * the results in input order. A rejection ends the stage and fails the
 * pipeline, and nothing further is pulled from the source.
 */
export function asyncMapStage<T, R>(fn: (item: T) => Promise<R> | R): AsyncStage<T, R> {
  throw new Error("ex5: asyncMapStage() is not implemented yet - edit this file.");
}
