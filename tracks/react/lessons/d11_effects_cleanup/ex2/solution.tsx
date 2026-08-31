// d11_effects_cleanup / ex2 - an interval that belongs to the component.
// See tracks/react/lessons/d11_effects_cleanup/README.md, "Exercise 2".
import { useEffect, useState } from "react";

export function IntervalClock({ tick }: { tick: () => void }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setInterval(() => {
      tick();
      setSeconds((count) => count + 1);
    }, 1000);
  }, [tick]);

  return <p role="status">{seconds} seconds</p>;
}
