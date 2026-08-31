// d09_forms_validation / ex6 - two fields, one rule between them.
// See tracks/react/lessons/d09_forms_validation/README.md, "Exercise 6".
import { useState } from "react";

export function DateRange({
  onSubmit,
}: {
  onSubmit: (range: { start: string; end: string }) => void;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");

  function handleClick() {
    if (new Date(end) < new Date(start)) {
      setError("End date cannot be before the start date");
      return;
    }
    setError("");
    onSubmit({ start, end });
  }

  return (
    <>
      <label htmlFor="start">Start date</label>
      <input
        id="start"
        type="date"
        value={start}
        onChange={(event) => setStart(event.target.value)}
      />

      <label htmlFor="end">End date</label>
      <input id="end" type="date" value={end} onChange={(event) => setEnd(event.target.value)} />

      {error !== "" && <p role="alert">{error}</p>}

      <button type="button" onClick={handleClick}>
        Check availability
      </button>
    </>
  );
}
