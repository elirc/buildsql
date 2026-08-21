// i3_interview_rapidfire / ex3 - the update queue, and batching.
// See tracks/react/lessons/i3_interview_rapidfire/README.md, "Round 3".
//
// onRender() is the render-counting probe. Leave it where it is.
import { useState } from "react";

export function TripleBump({ onRender }: { onRender: () => void }) {
  const [count, setCount] = useState(0);

  onRender();

  function addThree() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  return (
    <>
      <output>{count}</output>
      <button type="button" onClick={addThree}>
        Add three
      </button>
    </>
  );
}
