// 03_async_patterns / review1 - the first one that works, wins.
// See lessons/03_async_patterns/README.md, "Review".

export async function firstSuccessful<T>(tasks: (() => Promise<T>)[]): Promise<T> {
  throw new Error("review1: firstSuccessful() is not implemented yet - edit this file.");
}
