// d10_error_patterns / ex2 - reference solution (author only, used by `dojo verify`).

export interface GuardedCallback<A extends unknown[]> {
  (...args: A): void;
  calls(): number;
  suppressed(): number;
}

export function onceCallback<A extends unknown[]>(
  callback: (...args: A) => void,
): GuardedCallback<A> {
  let calls = 0;
  let suppressed = 0;

  const guarded = ((...args: A): void => {
    if (calls > 0) {
      // Counted, not thrown: the caller is a library you do not control, and
      // crashing it does not make its bug your problem any less.
      suppressed += 1;
      return;
    }
    calls += 1;
    callback(...args);
  }) as GuardedCallback<A>;

  guarded.calls = () => calls;
  guarded.suppressed = () => suppressed;

  return guarded;
}
