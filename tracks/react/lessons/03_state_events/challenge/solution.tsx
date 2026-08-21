// 03_state_events / challenge - state that remembers where it has been.
// See tracks/react/lessons/03_state_events/README.md, "Challenge".
import { useState } from "react";

export function UndoableCounter() {
  const [count, setCount] = useState(0);

  return (
    <>
      <output>{count}</output>
      <button type="button" onClick={() => setCount((n) => n + 1)}>
        Increment
      </button>
      <button type="button" onClick={() => setCount((n) => n - 1)}>
        Decrement
      </button>
      <button type="button">Undo</button>
    </>
  );
}
