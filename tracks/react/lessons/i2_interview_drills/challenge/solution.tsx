// i2_interview_drills / challenge - the 45-minute task: a typeahead.
// See tracks/react/lessons/i2_interview_drills/README.md, "Challenge".
import { useId, useState } from "react";

export function Typeahead({
  search,
  onSelect,
}: {
  search: (query: string) => Promise<string[]>;
  onSelect: (value: string) => void;
}) {
  const inputId = useId();
  const [query, setQuery] = useState("");

  return (
    <>
      <label htmlFor={inputId}>Search products</label>
      <input
        id={inputId}
        role="combobox"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </>
  );
}
