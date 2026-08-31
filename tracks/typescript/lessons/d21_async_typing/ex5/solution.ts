// d21_async_typing / ex5 - try again, up to a point.
// See lessons/d21_async_typing/README.md, "ex5".
//
// The stub promises unknown and throws, so it neither retries
// nor returns.

export async function withRetry<T>(task: () => Promise<T>, attempts: number): Promise<unknown> {
  throw new Error("ex5: withRetry() is not implemented yet - edit this file.");
}
