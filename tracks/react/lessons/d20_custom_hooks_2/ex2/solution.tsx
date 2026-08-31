// d20_custom_hooks_2 / ex2 - a subscription nothing ever closes.
// See tracks/react/lessons/d20_custom_hooks_2/README.md, "Exercise 2".
import { useEffect, useState } from "react";

export function useSubscription<T>(
  subscribe: (onValue: (value: T) => void) => () => void,
  initial: T,
): T {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    subscribe(setValue);
  }, [subscribe]);

  return value;
}
