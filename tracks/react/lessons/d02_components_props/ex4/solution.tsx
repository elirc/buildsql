// d02_components_props / ex4 - a controlled number, owned by the parent.
// See tracks/react/lessons/d02_components_props/README.md, "Exercise 4".
import { useState } from "react";

export function Stepper({
  value,
  step = 1,
  min,
  max,
  onChange,
}: {
  value: number;
  step?: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const [current, setCurrent] = useState(value);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCurrent(current - step);
          onChange(current - step);
        }}
      >
        Decrease
      </button>
      <output>{current}</output>
      <button
        type="button"
        onClick={() => {
          setCurrent(current + step);
          onChange(current + step);
        }}
      >
        Increase
      </button>
    </>
  );
}
