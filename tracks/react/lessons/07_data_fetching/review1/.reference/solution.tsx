// 07_data_fetching / review1 - reference solution.
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
    let current = true;

    fetchResults(query).then((found) => {
      if (current) {
        setResults(found);
      }
    });

    return () => {
      current = false;
    };
  }, [query, fetchResults]);

  return (
    <ul>
      {results.map((result) => (
        <li key={result}>{result}</li>
      ))}
    </ul>
  );
}
