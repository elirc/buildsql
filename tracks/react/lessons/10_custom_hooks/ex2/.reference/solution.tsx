// 10_custom_hooks / ex2 - reference solution.
import { useCallback, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (stored === null) {
      return initialValue;
    }
    try {
      return JSON.parse(stored) as T;
    } catch {
      return initialValue;
    }
  });

  const store = useCallback(
    (next: T) => {
      setValue(next);
      localStorage.setItem(key, JSON.stringify(next));
    },
    [key],
  );

  return [value, store];
}
