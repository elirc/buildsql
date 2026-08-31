// d11_effects_cleanup / ex2 - reference solution.
import { useEffect, useState } from "react";

export function IntervalClock({ tick }: { tick: () => void }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      tick();
      setSeconds((count) => count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return <p role="status">{seconds} seconds</p>;
}
