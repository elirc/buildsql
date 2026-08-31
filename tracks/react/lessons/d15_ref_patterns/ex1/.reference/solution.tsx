// d15_ref_patterns / ex1 - reference solution.
import { useEffect, useRef } from "react";

export function PressureGauge({ label, reading }: { label: string; reading: number }) {
  // Per instance, and it survives renders without causing them. A `let` in the
  // component body would reset on every render; a `let` at module scope would
  // be shared by every gauge on the page.
  const previous = useRef<number | null>(null);

  // Read during render, written after the commit - so the value on screen is
  // always the one from the render before this one.
  const was = previous.current;

  useEffect(() => {
    previous.current = reading;
  });

  return (
    <p role="status">
      {label}: now {reading}, was {was === null ? "nothing yet" : was}
    </p>
  );
}
