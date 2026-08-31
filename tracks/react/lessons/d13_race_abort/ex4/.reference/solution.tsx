// d13_race_abort / ex4 - reference solution.
import { useEffect, useId, useState } from "react";

export function SymbolSearch({ lookup }: { lookup: (ticker: string) => Promise<string> }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);

  // The handler's only job is to record what the user typed. Asking about it
  // is a synchronisation with an outside system, so it belongs in an effect -
  // and an effect comes with the cleanup the guard needs.
  useEffect(() => {
    setResult(null);
    if (query === "") return;

    let current = true;
    lookup(query).then((name) => {
      if (!current) return;
      setResult(name);
    });

    return () => {
      current = false;
    };
  }, [query, lookup]);

  return (
    <>
      <label htmlFor={id}>Ticker</label>
      <input id={id} value={query} onChange={(event) => setQuery(event.target.value)} />
      {query === "" ? (
        <p role="status">Type a ticker</p>
      ) : result === null ? (
        <p role="status">Searching for {query}</p>
      ) : (
        <p>{result}</p>
      )}
    </>
  );
}
