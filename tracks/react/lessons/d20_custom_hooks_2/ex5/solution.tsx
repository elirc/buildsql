// d20_custom_hooks_2 / ex5 - state initialised once, for a key that can change.
// See tracks/react/lessons/d20_custom_hooks_2/README.md, "Exercise 5".
import { useCallback, useState } from "react";

export type KeyValueStore = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export function useStorageState(
  key: string,
  initial: string,
  storage: KeyValueStore,
): [string, (next: string) => void] {
  const [value, setValue] = useState(() => {
    const raw = storage.getItem(key);
    return raw === null ? initial : (JSON.parse(raw) as string);
  });

  const set = useCallback(
    (next: string) => {
      setValue(next);
      storage.setItem(key, JSON.stringify(next));
    },
    [key, storage],
  );

  return [value, set];
}
