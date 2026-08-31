// d11_effects_cleanup / ex4 - reference solution.
import { useEffect, useState } from "react";

export function Countdown({ from, onDone }: { from: number; onDone: () => void }) {
  const [left, setLeft] = useState(from);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      return;
    }
    const id = setInterval(() => {
      setLeft((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && left === 0) {
      setRunning(false);
      onDone();
    }
  }, [running, left, onDone]);

  return (
    <>
      <button type="button" onClick={() => setRunning(true)}>
        Start
      </button>
      <button type="button" onClick={() => setRunning(false)}>
        Pause
      </button>
      <p role="status">Time left: {left}</p>
    </>
  );
}
