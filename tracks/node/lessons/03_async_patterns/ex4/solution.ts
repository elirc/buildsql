// 03_async_patterns / ex4 - a deadline, and the timer you have to clean up.
// See lessons/03_async_patterns/README.md, "Exercise 4".

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  throw new Error("ex4: withTimeout() is not implemented yet - edit this file.");
}
