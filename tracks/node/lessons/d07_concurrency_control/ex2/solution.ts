// d07_concurrency_control / ex2 - de-duplicate, do not cache.
// See lessons/d07_concurrency_control/README.md, "Problem 2".

/**
 * While a call is in flight, further calls join it and share its outcome.
 * Once it settles - fulfilled OR rejected - the next call starts a new one.
 * Nothing is remembered between flights.
 */
export function singleFlight<T>(fn: () => Promise<T>): () => Promise<T> {
  throw new Error("ex2: singleFlight() is not implemented yet - edit this file.");
}
