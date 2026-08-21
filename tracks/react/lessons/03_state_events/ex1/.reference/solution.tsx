// 03_state_events / ex1 - reference solution.
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <>
      <output>{count}</output>
      <button type="button" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </>
  );
}
