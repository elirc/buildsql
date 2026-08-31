// d04_timers_micro / ex6 - virtual time, with no timers at all.
// See lessons/d04_timers_micro/README.md, "Problem 6".

export interface Scheduler {
  /** Run `run` when virtual time reaches `time`. */
  at(time: number, run: () => void): void;
  /**
   * Move time forward to `time`, running everything due - including anything
   * scheduled inside those callbacks that is also due. Returns how many ran.
   * Throws `time cannot go backwards`.
   */
  advanceTo(time: number): number;
  now(): number;
  pending(): number;
}

/** Starts at time 0. */
export function createScheduler(): Scheduler {
  throw new Error("ex6: createScheduler() is not implemented yet - edit this file.");
}
