// d04_timers_micro / ex7 - an interval that does not drift.
// See lessons/d04_timers_micro/README.md, "Problem 7".

export interface SelfCorrectingOptions {
  intervalMs: number;
  /** injected wall clock, in milliseconds */
  now: () => number;
  onTick: (n: number) => void;
}

export interface SelfCorrecting {
  start(): void;
  stop(): void;
}

/**
 * Tick n is due at `startedAt + n * intervalMs`, whatever the handler cost.
 * Each delay is computed from the clock, never assumed, and never negative.
 */
export function createSelfCorrectingInterval(
  options: SelfCorrectingOptions,
): SelfCorrecting {
  throw new Error(
    "ex7: createSelfCorrectingInterval() is not implemented yet - edit this file.",
  );
}
