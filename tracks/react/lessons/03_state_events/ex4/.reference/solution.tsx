// 03_state_events / ex4 - reference solution.
import { useState } from "react";

export function BatchProbe({ onRender }: { onRender: () => void }) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);

  onRender();

  function handleClick() {
    setA((previous) => previous + 1);
    setB((previous) => previous + 1);
    setC((previous) => previous + 1);
  }

  return (
    <>
      <output>
        {a}-{b}-{c}
      </output>
      <button type="button" onClick={handleClick}>
        Bump all
      </button>
    </>
  );
}
