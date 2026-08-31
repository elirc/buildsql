// d03_event_loop_order / ex5 - starving the loop, and not starving it.
// See lessons/d03_event_loop_order/README.md, "Problem 5".

/**
 * Handle every item in order, one per scheduled callback, using the queue that
 * re-enters the checkpoint - so nothing else in the process gets a turn until
 * the last item is done. Resolves when it is.
 */
export function drainQueue<T>(items: readonly T[], handle: (item: T) => void): Promise<void> {
  throw new Error("ex5: drainQueue() is not implemented yet - edit this file.");
}

/**
 * The same work, scheduled so that the event loop gets a full turn between
 * items.
 */
export function drainQueueFairly<T>(
  items: readonly T[],
  handle: (item: T) => void,
): Promise<void> {
  throw new Error("ex5: drainQueueFairly() is not implemented yet - edit this file.");
}
