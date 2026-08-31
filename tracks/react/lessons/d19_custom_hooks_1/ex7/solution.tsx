// d19_custom_hooks_1 / ex7 - a brand new API object every render.
// See tracks/react/lessons/d19_custom_hooks_1/README.md, "Exercise 7".
import { useState } from "react";

export function useCollection(initial: string[]) {
  const [items, setItems] = useState(initial);

  function add(item: string) {
    setItems((current) => [...current, item]);
  }

  function remove(item: string) {
    setItems((current) => current.filter((entry) => entry !== item));
  }

  function clear() {
    setItems([]);
  }

  return { items, add, remove, clear };
}
