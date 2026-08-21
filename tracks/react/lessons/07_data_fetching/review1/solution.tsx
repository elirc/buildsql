// 07_data_fetching / review1 - the same race, in a search box.
// See tracks/react/lessons/07_data_fetching/README.md, "Review".
import { useEffect, useState } from "react";

export function SearchResults({
  query,
  fetchResults,
}: {
  query: string;
  fetchResults: (query: string) => Promise<string[]>;
}) {
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    fetchResults(query).then(setResults);
  }, [query, fetchResults]);

  return (
    <ul>
      {results.map((result) => (
        <li key={result}>{result}</li>
      ))}
    </ul>
  );
}
