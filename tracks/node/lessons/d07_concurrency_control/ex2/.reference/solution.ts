// d07_concurrency_control / ex2 - reference solution (author only, used by `dojo verify`).

export function singleFlight<T>(fn: () => Promise<T>): () => Promise<T> {
  let inFlight: Promise<T> | undefined;

  return (): Promise<T> => {
    if (inFlight) return inFlight;

    const flight = fn().finally(() => {
      // Clear only if this flight is still the current one, and clear on BOTH
      // outcomes - a remembered rejection would be a cache of a failure.
      if (inFlight === flight) inFlight = undefined;
    });
    // The .finally() promise is the one callers share, so every one of them
    // sees the same settlement.
    inFlight = flight;
    return flight;
  };
}
