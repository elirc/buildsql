// d19_custom_hooks_1 / ex7 - reference solution.
import { useCallback, useMemo, useState } from "react";

export function useCollection(initial: string[]) {
  const [items, setItems] = useState(initial);

  // Every one of these uses the updater form, so none of them closes over
  // `items` and none of them has a dependency.
  const add = useCallback((item: string) => {
    setItems((current) => (current.includes(item) ? current : [...current, item]));
  }, []);

  const remove = useCallback((item: string) => {
    // Returning the state unchanged is how a setter says "nothing happened",
    // and React skips the render for it.
    setItems((current) => (current.includes(item) ? current.filter((e) => e !== item) : current));
  }, []);

  const clear = useCallback(() => {
    setItems((current) => (current.length === 0 ? current : []));
  }, []);

  // The wrapper is memoized too, or the object would be new every render even
  // though everything inside it is stable.
  return useMemo(() => ({ items, add, remove, clear }), [items, add, remove, clear]);
}
