// d12_fetching_states / ex3 - reference solution.
import { useEffect, useState } from "react";

export function SearchPanel({
  query,
  search,
}: {
  query: string;
  search: (query: string) => Promise<string[]>;
}) {
  const [results, setResults] = useState<string[] | null>(null);

  useEffect(() => {
    setResults(null);
    search(query).then(setResults);
  }, [query, search]);

  if (results === null) {
    return <p role="status">Searching for {query}</p>;
  }
  if (results.length === 0) {
    return <p>No matches for {query}</p>;
  }

  return (
    <ul>
      {results.map((result) => (
        <li key={result}>{result}</li>
      ))}
    </ul>
  );
}
