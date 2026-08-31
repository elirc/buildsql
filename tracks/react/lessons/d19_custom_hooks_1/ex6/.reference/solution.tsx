// d19_custom_hooks_1 / ex6 - reference solution.
import { useMemo } from "react";

export function useFilteredList(items: string[], query: string, onFilter: () => void) {
  // The answer depends on the list and the question and nothing else, so those
  // are the dependencies. Every other render - a click somewhere, a parent
  // redrawing - gets the answer React already has.
  const matches = useMemo(() => {
    onFilter();
    const needle = query.toLowerCase();
    return items.filter((item) => item.toLowerCase().includes(needle));
  }, [items, query, onFilter]);

  return { matches, count: matches.length };
}
