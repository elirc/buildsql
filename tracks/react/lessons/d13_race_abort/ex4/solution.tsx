// d13_race_abort / ex4 - a race the keyboard started.
// See tracks/react/lessons/d13_race_abort/README.md, "Exercise 4".
import { useId, useState } from "react";

export function SymbolSearch({ lookup }: { lookup: (ticker: string) => Promise<string> }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function handleChange(next: string) {
    setQuery(next);
    setResult(null);
    if (next === "") return;
    lookup(next).then((name) => {
      setResult(name);
    });
  }

  return (
    <>
      <label htmlFor={id}>Ticker</label>
      <input id={id} value={query} onChange={(event) => handleChange(event.target.value)} />
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
