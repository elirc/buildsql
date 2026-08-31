// d04_timers_micro / ex4 - reference solution (author only, used by `dojo verify`).

export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): (...args: A) => void {
  let handle: ReturnType<typeof setTimeout> | undefined;
  let suppressed: A | undefined;

  // "Is a window open" and "is a timer armed" are the same question, so one
  // variable answers both.
  const openWindow = (): void => {
    handle = setTimeout(() => {
      handle = undefined;
      if (suppressed === undefined) return; // nothing waited: let the window close
      const args = suppressed;
      suppressed = undefined;
      fn(...args);
      openWindow(); // the trailing call is a call, so it opens its own window
    }, waitMs);
  };

  return (...args: A): void => {
    if (handle === undefined) {
      fn(...args);
      openWindow();
      return;
    }
    suppressed = args;
  };
}
