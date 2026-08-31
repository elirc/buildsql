// d24_mixed_gauntlet / ex7 - debounce + request + the race that is still there.
// See tracks/react/lessons/d24_mixed_gauntlet/README.md, "Exercise 7".
import { useEffect, useId, useState } from "react";

export function SearchWorkbench({
  search,
}: {
  search: (query: string) => Promise<string[]>;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState("");
  const [results, setResults] = useState<string[] | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (query === "") return;
    setTimeout(() => setAsked(query), 300);
  }, [query]);

  useEffect(() => {
    if (asked === "") return;
    setPending(true);
    search(asked).then((next) => {
      setResults(next);
      setPending(false);
    });
  }, [asked, search]);

  const status = pending ? "Searching" : results === null ? "Idle" : `${results.length} results`;

  return (
    <>
      <label htmlFor={id}>Query</label>
      <input id={id} value={query} onChange={(event) => setQuery(event.target.value)} />
      <p role="status">{status}</p>
      <ul>
        {(results ?? []).map((result) => (
          <li key={result}>{result}</li>
        ))}
      </ul>
    </>
  );
}
