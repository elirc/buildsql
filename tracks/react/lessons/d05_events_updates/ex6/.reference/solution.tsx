// d05_events_updates / ex6 - reference solution.
import { useState } from "react";

export function Basket({ onLog }: { onLog: (count: number) => void }) {
  const [count, setCount] = useState(0);

  function addTwo() {
    setCount((current) => current + 1);
    setCount((current) => current + 1);
    onLog(count);
  }

  return (
    <>
      <p role="status">{count} in basket</p>
      <button type="button" onClick={addTwo}>
        Add two
      </button>
    </>
  );
}
