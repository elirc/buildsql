// d04_timers_micro / ex4 - throttle.
// See lessons/d04_timers_micro/README.md, "Problem 4".

/**
 * Run `fn` immediately, then at most once per `waitMs`.
 *
 * Calls made inside a window are suppressed, but the last of them runs when the
 * window closes - and that run opens a new window. A window that closes with
 * nothing suppressed runs nothing and arms nothing.
 */
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): (...args: A) => void {
  throw new Error("ex4: throttle() is not implemented yet - edit this file.");
}
