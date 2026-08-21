// 06_effects / challenge - the stale closure, live.
// See tracks/react/lessons/06_effects/README.md, "Challenge".
import { useEffect, useState } from "react";

export function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      return;
    }
    const id = setInterval(() => {
      setSeconds(seconds + 1);
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
