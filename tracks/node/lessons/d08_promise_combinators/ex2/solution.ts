// d08_promise_combinators / ex2 - write Promise.race.
// See lessons/d08_promise_combinators/README.md, "Problem 2".
//
// Do not call Promise.race.

/**
 * Settle with the first input to settle - fulfilled or rejected, whichever
 * comes first. An empty array never settles at all.
 */
export function raceFirst<T>(promises: readonly Promise<T>[]): Promise<T> {
  throw new Error("ex2: raceFirst() is not implemented yet - edit this file.");
}
