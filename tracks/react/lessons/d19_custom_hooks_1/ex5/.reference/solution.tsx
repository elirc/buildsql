// d19_custom_hooks_1 / ex5 - reference solution.
import { useCallback, useEffect, useState } from "react";

export function useCountdown(from: number) {
  const [remaining, setRemaining] = useState(from);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    // Two reasons not to be ticking: nobody started it, and there is nothing
    // left to count. Listing `remaining` in the array is what makes the second
    // one take effect the moment it happens.
    if (!running || remaining === 0) return;

    const id = setInterval(() => {
      setRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    // The half of the effect that pausing and unmounting both depend on.
    return () => clearInterval(id);
  }, [running, remaining]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(from);
  }, [from]);

  return { remaining, running, start, pause, reset };
}
