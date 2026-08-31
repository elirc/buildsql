// d20_custom_hooks_2 / ex4 - reference solution.
import { useCallback, useEffect, useRef } from "react";

export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number,
) {
  // The newest function, so the returned one never has to change identity to
  // stay up to date.
  const latest = useRef(fn);
  useEffect(() => {
    latest.current = fn;
  });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Anything still pending when the component goes has nobody left to talk to.
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  return useCallback(
    (...args: A) => {
      // Cancelling what was already scheduled is the entire difference between
      // a debounce and a delay.
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        latest.current(...args);
      }, delay);
    },
    [delay],
  );
}
