// d04_timers_micro / ex3 - debounce.
// See lessons/d04_timers_micro/README.md, "Problem 3".

export interface Debounced<A extends unknown[]> {
  (...args: A): void;
  /** Drop the waiting call, if there is one. */
  cancel(): void;
  pending(): boolean;
}

/**
 * Run `fn` once, `waitMs` after the LAST call, with that call's arguments.
 * Every call restarts the wait, and there is never more than one timer.
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): Debounced<A> {
  throw new Error("ex3: debounce() is not implemented yet - edit this file.");
}
