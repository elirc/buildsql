// d03_event_loop_order / ex5 - reference solution (author only, used by `dojo verify`).

/** One driver, parameterised by how the next step is scheduled. */
function drainWith<T>(
  items: readonly T[],
  handle: (item: T) => void,
  schedule: (step: () => void) => void,
): Promise<void> {
  return new Promise<void>((resolve) => {
    let index = 0;
    const step = (): void => {
      if (index >= items.length) {
        resolve();
        return;
      }
      handle(items[index]);
      index += 1;
      schedule(step);
    };
    // The first item runs synchronously; only the *gaps* are scheduled.
    step();
  });
}

export function drainQueue<T>(items: readonly T[], handle: (item: T) => void): Promise<void> {
  // process.nextTick re-enters the checkpoint without ever reaching a loop
  // phase, so nothing else runs until the queue empties.
  return drainWith(items, handle, (step) => process.nextTick(step));
}

export function drainQueueFairly<T>(
  items: readonly T[],
  handle: (item: T) => void,
): Promise<void> {
  // setImmediate parks the work in the check phase, so the loop completes a
  // turn - timers, I/O, everything - between items.
  return drainWith(items, handle, (step) => setImmediate(step));
}
