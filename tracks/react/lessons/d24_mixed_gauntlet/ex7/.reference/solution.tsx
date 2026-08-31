// d24_mixed_gauntlet / ex7 - reference solution.
import { useEffect, useId, useState } from "react";

export function SearchWorkbench({
  search,
}: {
  search: (query: string) => Promise<string[]>;
}) {
  const id = useId();
  // What is in the box, and what has actually been asked. They are different
  // things, and separating them is what a debounce is.
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState("");
  const [results, setResults] = useState<string[] | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (query === "") return;

    const timer = setTimeout(() => setAsked(query), 300);
    // The cancellation *is* the debounce. Without it every keystroke still
    // sends a request, just 300ms later than it would have.
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (asked === "") return;

    // Debouncing makes the race rarer and cannot remove it: a slow answer to
    // an old question still arrives after a fast answer to a new one.
    let current = true;
    setPending(true);

    search(asked).then((next) => {
      if (!current) return;
      setResults(next);
      setPending(false);
    });

    return () => {
      current = false;
    };
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
