// d03_event_loop_order / ex4 - one label per queue.
// See lessons/d03_event_loop_order/README.md, "Problem 4".

/**
 * Log five labels so they come out in this order, from inside a timer callback:
 *
 *   "sync"   immediately, before this function returns
 *   "tick"   before any microtask the caller queued first
 *   "micro"  after that microtask
 *   "check"  in the check phase of this turn of the loop
 *   "timer"  in the timers phase of the next turn
 */
export function scheduleLabels(log: (label: string) => void): void {
  throw new Error("ex4: scheduleLabels() is not implemented yet - edit this file.");
}
