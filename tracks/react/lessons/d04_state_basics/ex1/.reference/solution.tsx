// d04_state_basics / ex1 - reference solution.
import { useState } from "react";

export function WaterTracker({ goal }: { goal: number }) {
  const [glasses, setGlasses] = useState(0);

  return (
    <>
      <p role="status">
        {glasses} of {goal} glasses
      </p>
      <button type="button" onClick={() => setGlasses(glasses + 1)} disabled={glasses >= goal}>
        Drink
      </button>
      <button type="button" onClick={() => setGlasses(0)}>
        Reset
      </button>
    </>
  );
}
