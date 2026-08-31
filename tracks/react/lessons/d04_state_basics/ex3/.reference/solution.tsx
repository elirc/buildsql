// d04_state_basics / ex3 - reference solution.
import { useState } from "react";

export function DraftBox({ makeInitial }: { makeInitial: () => string }) {
  const [draft, setDraft] = useState(makeInitial);

  return (
    <>
      <p role="status">{draft}</p>
      <button type="button" onClick={() => setDraft((current) => current + "!")}>
        Append
      </button>
    </>
  );
}
