// d20_custom_hooks_2 / ex8 - a component that takes control back off its parent.
// See tracks/react/lessons/d20_custom_hooks_2/README.md, "Exercise 8".
import { useCallback, useState } from "react";

export function useControllableState<T>(options: {
  value?: T;
  defaultValue: T;
  onChange?: (next: T) => void;
}): [T, (next: T) => void] {
  const [internal, setInternal] = useState(options.value ?? options.defaultValue);

  const set = useCallback(
    (next: T) => {
      setInternal(next);
      options.onChange?.(next);
    },
    [options],
  );

  return [internal, set];
}
