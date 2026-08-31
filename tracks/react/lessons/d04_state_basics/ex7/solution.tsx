// d04_state_basics / ex7 - three taps that all land on the same second.
// See tracks/react/lessons/d04_state_basics/README.md, "Exercise 7".
import { useState } from "react";

export function DelayedCounter() {
  const [count, setCount] = useState(0);

  return (
    <>
      <p role="status">Count: {count}</p>
      <button
        type="button"
        onClick={() => {
          setTimeout(() => setCount(count + 1), 1000);
        }}
      >
        Later
      </button>
      <button type="button" onClick={() => setCount(0)}>
        Reset
      </button>
    </>
  );
}
