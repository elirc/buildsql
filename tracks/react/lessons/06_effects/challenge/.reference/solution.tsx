// 06_effects / challenge - reference solution.
import { useEffect, useState } from "react";

export function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      return;
    }
    const id = setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  return (
    <>
      <output>{seconds}</output>
      <button type="button" onClick={() => setRunning(true)}>
        Start
      </button>
      <button type="button" onClick={() => setRunning(false)}>
        Stop
      </button>
    </>
  );
}
