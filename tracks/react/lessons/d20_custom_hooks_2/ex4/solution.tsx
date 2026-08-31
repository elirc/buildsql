// d20_custom_hooks_2 / ex4 - a delay, which is not a debounce.
// See tracks/react/lessons/d20_custom_hooks_2/README.md, "Exercise 4".
import { useCallback } from "react";

export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number,
) {
  return useCallback(
    (...args: A) => {
      setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  );
}
