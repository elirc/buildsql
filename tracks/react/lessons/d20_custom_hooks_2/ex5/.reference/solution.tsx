// d20_custom_hooks_2 / ex5 - reference solution.
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
  function read(which: string): string {
    const raw = storage.getItem(which);
    return raw === null ? initial : (JSON.parse(raw) as string);
  }

  // The value *and* the key it belongs to. Keeping them together is what makes
  // "this value is out of date" a question you can actually ask.
  const [entry, setEntry] = useState(() => ({ key, value: read(key) }));

  let current = entry;
  if (entry.key !== key) {
    // Adjusting state during render: React throws this render away and runs it
    // again immediately, so nothing is ever committed showing the old key's
    // value under the new key.
    current = { key, value: read(key) };
    setEntry(current);
  }

  const set = useCallback(
    (next: string) => {
      setEntry({ key, value: next });
      storage.setItem(key, JSON.stringify(next));
    },
    [key, storage],
  );

  return [current.value, set];
}
