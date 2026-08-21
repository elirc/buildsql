// i2_interview_drills / ex1 - "build me a search box that doesn't hammer the API."
// See tracks/react/lessons/i2_interview_drills/README.md, "Drill 1".
import { useEffect, useState } from "react";

export function DebouncedSearch({ search }: { search: (query: string) => Promise<string[]> }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    search(query).then(setResults);
  }, [query, search]);

  return (
    <>
      <label htmlFor="search">Search</label>
      <input id="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      <ul>
        {results.map((result) => (
          <li key={result}>{result}</li>
        ))}
      </ul>
    </>
  );
}
