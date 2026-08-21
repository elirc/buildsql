// i2_interview_drills / review1 - debounce and race, one more time.
// See tracks/react/lessons/i2_interview_drills/README.md, "Review".
import { useEffect, useState } from "react";

export function LiveFilter({
  fetchMatches,
}: {
  fetchMatches: (query: string) => Promise<string[]>;
}) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<string[]>([]);

  useEffect(() => {
    fetchMatches(query).then(setMatches);
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
