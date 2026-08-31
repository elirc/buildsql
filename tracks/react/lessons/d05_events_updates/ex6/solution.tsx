// d05_events_updates / ex6 - two updates and one log, from a single click.
// See tracks/react/lessons/d05_events_updates/README.md, "Exercise 6".
import { useState } from "react";

export function Basket({ onLog }: { onLog: (count: number) => void }) {
  const [count, setCount] = useState(0);

  function addTwo() {
    setCount(count + 1);
    setCount(count + 1);
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
