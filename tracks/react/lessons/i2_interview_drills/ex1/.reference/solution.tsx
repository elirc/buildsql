// i2_interview_drills / ex1 - reference solution.
import { useEffect, useState } from "react";

export function DebouncedSearch({ search }: { search: (query: string) => Promise<string[]> }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    let current = true;
    const timer = setTimeout(() => {
      search(query).then((found) => {
        if (current) {
          setResults(found);
        }
      });
    }, 300);

    return () => {
      current = false;
      clearTimeout(timer);
    };
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
