// 10_custom_hooks / ex3 - waiting for the typing to stop.
// See tracks/react/lessons/10_custom_hooks/README.md, "Exercise 3".
import { useState } from "react";

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  return value;
}
