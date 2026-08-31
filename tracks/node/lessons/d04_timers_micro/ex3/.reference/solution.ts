// d04_timers_micro / ex3 - reference solution (author only, used by `dojo verify`).

export interface Debounced<A extends unknown[]> {
  (...args: A): void;
  cancel(): void;
  pending(): boolean;
}

export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): Debounced<A> {
  let handle: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: A | undefined;

  const debounced = ((...args: A): void => {
    lastArgs = args;
    // Clearing first is what makes the wait restart instead of stacking up.
    if (handle !== undefined) clearTimeout(handle);
    handle = setTimeout(() => {
      handle = undefined;
      const args_ = lastArgs as A;
      lastArgs = undefined;
      fn(...args_);
    }, waitMs);
  }) as Debounced<A>;

  debounced.cancel = (): void => {
    if (handle !== undefined) clearTimeout(handle);
    handle = undefined;
    lastArgs = undefined;
  };

  debounced.pending = (): boolean => handle !== undefined;

  return debounced;
}
