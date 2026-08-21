// i2_interview_drills / review1 - reference solution.
import { useEffect, useState } from "react";

export function LiveFilter({
  fetchMatches,
}: {
  fetchMatches: (query: string) => Promise<string[]>;
}) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<string[]>([]);

  useEffect(() => {
    if (query.trim() === "") {
      setMatches([]);
      return;
    }

    let current = true;
    const timer = setTimeout(() => {
      fetchMatches(query).then((found) => {
        if (current) {
          setMatches(found);
        }
      });
    }, 200);

    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [query, fetchMatches]);

  return (
    <>
      <label htmlFor="live-filter">Filter</label>
      <input id="live-filter" value={query} onChange={(event) => setQuery(event.target.value)} />
      <ul>
        {matches.map((match) => (
          <li key={match}>{match}</li>
        ))}
      </ul>
    </>
  );
}
