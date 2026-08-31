// d21_async_typing / ex1 - one at a time, in order.
// See lessons/d21_async_typing/README.md, "ex1".
//
// The stub promises unknown[] and throws, so neither the order
// nor the element type is established.

export async function mapSeries<T, R>(
  values: readonly T[],
  fn: (value: T, index: number) => Promise<R>,
): Promise<unknown[]> {
  throw new Error("ex1: mapSeries() is not implemented yet - edit this file.");
}
