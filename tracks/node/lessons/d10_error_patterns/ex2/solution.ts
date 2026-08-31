// d10_error_patterns / ex2 - a callback that cannot be called twice.
// See lessons/d10_error_patterns/README.md, "Problem 2".

export interface GuardedCallback<A extends unknown[]> {
  (...args: A): void;
  /** how many times the wrapped callback really ran (0 or 1) */
  calls(): number;
  /** how many calls were refused */
  suppressed(): number;
}

export function onceCallback<A extends unknown[]>(
  callback: (...args: A) => void,
): GuardedCallback<A> {
  throw new Error("ex2: onceCallback() is not implemented yet - edit this file.");
}
