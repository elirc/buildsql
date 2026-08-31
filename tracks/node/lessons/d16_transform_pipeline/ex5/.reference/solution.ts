// d16_transform_pipeline / ex5 - reference solution (author only, used by `dojo verify`).

export type AsyncStage<T, R> = (source: AsyncIterable<T>) => AsyncGenerator<R>;

export function asyncMapStage<T, R>(fn: (item: T) => Promise<R> | R): AsyncStage<T, R> {
  return async function* stage(source: AsyncIterable<T>): AsyncGenerator<R> {
    for await (const item of source) {
      // Awaiting inside the loop is what gives you both properties for free:
      // one at a time, and therefore in order. It is also what stops the loop
      // pulling anything else once fn rejects.
      yield await fn(item);
    }
  };
}
