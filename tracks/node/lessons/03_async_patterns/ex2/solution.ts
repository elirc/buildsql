// 03_async_patterns / ex2 - one failure must not lose the other results.
// See lessons/03_async_patterns/README.md, "Exercise 2".

export interface Collected<T> {
  /** The values of the tasks that fulfilled, in input order. */
  ok: T[];
  /** The messages of the tasks that rejected, in input order. */
  failed: string[];
}

export async function collectResults<T>(tasks: (() => Promise<T>)[]): Promise<Collected<T>> {
  throw new Error("ex2: collectResults() is not implemented yet - edit this file.");
}
