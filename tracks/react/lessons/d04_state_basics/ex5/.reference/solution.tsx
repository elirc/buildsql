// d04_state_basics / ex5 - reference solution.

export function SearchSummary({
  items,
  query,
  onRender,
}: {
  items: string[];
  query: string;
  onRender: () => void;
}) {
  onRender();

  const matches = items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  const summary =
    query === ""
      ? `Showing all ${items.length} items`
      : `${matches.length} of ${items.length} items match ${query}`;

  return <p role="status">{summary}</p>;
}
