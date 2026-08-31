// d20_custom_hooks_2 / ex2 - reference solution.
import { useEffect, useState } from "react";

export function useSubscription<T>(
  subscribe: (onValue: (value: T) => void) => () => void,
  initial: T,
): T {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    // `subscribe` hands back the way to close what it opened, and that is
    // exactly the shape an effect's cleanup wants - so returning it directly
    // is the whole implementation.
    return subscribe(setValue);
  }, [subscribe]);

  return value;
}
