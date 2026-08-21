// 10_custom_hooks / ex2 - state that outlives the page.
// See tracks/react/lessons/10_custom_hooks/README.md, "Exercise 2".
import { useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);

  return [value, setValue];
}
