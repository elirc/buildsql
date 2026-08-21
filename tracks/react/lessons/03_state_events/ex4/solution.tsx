// 03_state_events / ex4 - three updates, one render.
// See tracks/react/lessons/03_state_events/README.md, "Exercise 4".
//
// onRender() is a probe the gate uses to count how many times this component
// rendered. It is already wired up - leave it where it is and do not add
// another call. Calling a prop during render is a measuring trick, not a
// pattern to copy.
import { useState } from "react";

export function BatchProbe({ onRender }: { onRender: () => void }) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);

  onRender();

  function handleClick() {
    // TODO: bump all three counters by one.
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
