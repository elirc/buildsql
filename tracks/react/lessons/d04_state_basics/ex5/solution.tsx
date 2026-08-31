// d04_state_basics / ex5 - a summary that is kept in state instead of computed.
// See tracks/react/lessons/d04_state_basics/README.md, "Exercise 5".
import { useEffect, useState } from "react";

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
  const [summary, setSummary] = useState("");

  useEffect(() => {
    const matches = items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
    setSummary(
      query === ""
        ? `Showing all ${items.length} items`
        : `${matches.length} of ${items.length} items match ${query}`,
    );
  }, [items, query]);

  return <p role="status">{summary}</p>;
}
