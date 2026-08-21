// 03_state_events / challenge - reference solution.
import { useState } from "react";

export function UndoableCounter() {
  const [history, setHistory] = useState<number[]>([0]);
  const count = history[history.length - 1];

  function push(next: (current: number) => number) {
    setHistory((previous) => [...previous, next(previous[previous.length - 1])]);
  }

  return (
    <>
      <output>{count}</output>
      <button type="button" onClick={() => push((n) => n + 1)}>
        Increment
      </button>
      <button type="button" onClick={() => push((n) => n - 1)}>
        Decrement
      </button>
      <button
        type="button"
        disabled={history.length === 1}
        onClick={() => setHistory((previous) => previous.slice(0, -1))}
      >
        Undo
      </button>
    </>
  );
}
