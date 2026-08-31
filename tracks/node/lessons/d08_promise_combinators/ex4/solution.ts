// d08_promise_combinators / ex4 - all, with a progress bar.
// See lessons/d08_promise_combinators/README.md, "Problem 4".

/**
 * Like `Promise.all` - results in input order, first rejection wins - but call
 * `onProgress(done, total)` once per fulfilment, in COMPLETION order, with the
 * running count. An empty input reports nothing at all.
 */
export function allWithProgress<T>(
  promises: readonly Promise<T>[],
  onProgress: (done: number, total: number) => void,
): Promise<T[]> {
  throw new Error("ex4: allWithProgress() is not implemented yet - edit this file.");
}
