// d04_timers_micro / ex1 - two ways to wait, and they are not the same wait.
// See lessons/d04_timers_micro/README.md, "Problem 1".

/** Resolve after `ms` milliseconds, leaving no timer behind. */
export function delay(ms: number): Promise<void> {
  throw new Error("ex1: delay() is not implemented yet - edit this file.");
}

/** Resolve on the microtask queue, without touching a timer at all. */
export function immediate(): Promise<void> {
  throw new Error("ex1: immediate() is not implemented yet - edit this file.");
}
