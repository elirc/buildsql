// d19_custom_hooks_1 / ex6 - work in the hook body runs on every render.
// See tracks/react/lessons/d19_custom_hooks_1/README.md, "Exercise 6".

export function useFilteredList(items: string[], query: string, onFilter: () => void) {
  onFilter();
  const needle = query.toLowerCase();
  const matches = items.filter((item) => item.toLowerCase().includes(needle));

  return { matches, count: matches.length };
}
