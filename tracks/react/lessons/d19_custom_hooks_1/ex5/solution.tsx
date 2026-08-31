// d19_custom_hooks_1 / ex5 - an interval nothing ever stops.
// See tracks/react/lessons/d19_custom_hooks_1/README.md, "Exercise 5".
import { useCallback, useEffect, useState } from "react";

export function useCountdown(from: number) {
  const [remaining, setRemaining] = useState(from);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    setInterval(() => setRemaining((current) => Math.max(current - 1, 0)), 1000);
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(from);
  }, [from]);

  return { remaining, running, start, pause, reset };
}
