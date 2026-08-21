// 03_state_events / ex2 - reference solution.
import { useState } from "react";

export function DoubleTap() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount((previous) => previous + 1);
    setCount((previous) => previous + 1);
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
