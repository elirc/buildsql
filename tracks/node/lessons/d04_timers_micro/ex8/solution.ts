// d04_timers_micro / ex8 - many deadlines, one timer.
// See lessons/d04_timers_micro/README.md, "Problem 8".

export interface DelayQueue {
  /** Run `run` in `delayMs`. Returns a cancel function, safe to call twice. */
  enqueue(delayMs: number, run: () => void): () => void;
  size(): number;
}

/**
 * A queue that holds exactly one underlying timer, aimed at the earliest
 * deadline, however many entries are waiting - and none at all when empty.
 * Entries run in deadline order, ties in insertion order.
 */
export function createDelayQueue(now: () => number): DelayQueue {
  throw new Error("ex8: createDelayQueue() is not implemented yet - edit this file.");
}
