// 03_state_events / ex2 - two updates in one handler.
// See tracks/react/lessons/03_state_events/README.md, "Exercise 2".
import { useState } from "react";

export function DoubleTap() {
  const [count, setCount] = useState(0);

  function handleClick() {
    // Two increments, one click. Both of these read the same `count`.
    setCount(count + 1);
    setCount(count + 1);
  }

  return (
    <>
      <output>{count}</output>
      <button type="button" onClick={handleClick}>
        Add two
      </button>
    </>
  );
}
