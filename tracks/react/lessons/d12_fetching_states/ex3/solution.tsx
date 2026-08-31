// d12_fetching_states / ex3 - nothing found is not the same as nothing yet.
// See tracks/react/lessons/d12_fetching_states/README.md, "Exercise 3".
import { useEffect, useState } from "react";

export function SearchPanel({
  query,
  search,
}: {
  query: string;
  search: (query: string) => Promise<string[]>;
}) {
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    search(query).then(setResults);
  }, [query, search]);

  return (
    <ul>
      {results.map((result) => (
        <li key={result}>{result}</li>
      ))}
    </ul>
  );
}
