// d04_state_basics / ex3 - an initial value that is expensive to build.
// See tracks/react/lessons/d04_state_basics/README.md, "Exercise 3".
import { useState } from "react";

export function DraftBox({ makeInitial }: { makeInitial: () => string }) {
  const [draft, setDraft] = useState(makeInitial());

  return (
    <>
      <p role="status">{draft}</p>
      <button type="button" onClick={() => setDraft(draft + "!")}>
        Append
      </button>
    </>
  );
}
