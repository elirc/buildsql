// d21_async_typing / ex3 - split the settled results.
// See lessons/d21_async_typing/README.md, "ex3".
//
// The stub promises unknown and throws, so neither list exists.

export async function partitionSettled<T>(
  tasks: readonly Promise<T>[],
): Promise<unknown> {
  throw new Error("ex3: partitionSettled() is not implemented yet - edit this file.");
}
