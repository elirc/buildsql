// d09_forms_validation / ex6 - reference solution.
import { useState } from "react";

export function DateRange({
  onSubmit,
}: {
  onSubmit: (range: { start: string; end: string }) => void;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [endError, setEndError] = useState("");

  function handleClick() {
    if (end < start) {
      setEndError("End date cannot be before the start date");
      return;
    }
    setEndError("");
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
        // No rule blames the start date, but it still answers the question.
        aria-invalid="false"
      />

      <label htmlFor="end">End date</label>
      <input
        id="end"
        type="date"
        value={end}
        onChange={(event) => {
          setEnd(event.target.value);
          setEndError("");
        }}
        aria-invalid={endError === "" ? "false" : "true"}
        aria-describedby={endError === "" ? undefined : "end-error"}
      />
      {endError !== "" && <p id="end-error">{endError}</p>}

      <button type="button" disabled={start === "" || end === ""} onClick={handleClick}>
        Check availability
      </button>
    </>
  );
}
