// d04_state_basics / ex7 - reference solution.
import { useRef, useState } from "react";

export function DelayedCounter() {
  const [count, setCount] = useState(0);
  const pending = useRef<ReturnType<typeof setTimeout>[]>([]);

  function later() {
    const id = setTimeout(() => {
      setCount((current) => current + 1);
    }, 1000);
    pending.current.push(id);
  }

  function reset() {
    pending.current.forEach(clearTimeout);
    pending.current = [];
    setCount(0);
  }

  return (
    <>
      <p role="status">Count: {count}</p>
      <button type="button" onClick={later}>
        Later
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
    </>
  );
}
